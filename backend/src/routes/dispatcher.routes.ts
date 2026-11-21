import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Pool } from 'pg';
import { io } from '../server.js';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

const UpdateQueueSchema = z.object({
  stopId: z.string().uuid(),
  delta: z.number().int().min(-5).max(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  statusNote: z.string().max(200).optional()
});

// GET /api/dispatcher/shift (Consulta turno asignado y estado del candado horario en Lima)
router.get('/shift', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          ds.id AS shift_id,
          ds.stop_id,
          s.name AS stop_name,
          s.type AS stop_type,
          s.address_reference,
          ST_Y(s.location)::float AS stop_latitude,
          ST_X(s.location)::float AS stop_longitude,
          ds.start_time,
          ds.end_time,
          ds.days_of_week,
          (NOW() AT TIME ZONE 'America/Lima')::time AS current_lima_time,
          EXTRACT(ISODOW FROM (NOW() AT TIME ZONE 'America/Lima'))::int AS current_lima_dow,
          COALESCE(sls.queued_vehicles_count, 0) AS current_queue_count,
          sls.status_note,
          sls.photo_url,
          sls.updated_at AS last_status_update
        FROM public.dispatcher_shifts ds
        JOIN public.stops s ON ds.stop_id = s.id
        LEFT JOIN public.stop_live_status sls ON s.id = sls.stop_id
        WHERE ds.dispatcher_id = $1 AND ds.is_active = TRUE
        LIMIT 1;
      `;
      const result = await client.query(query, [userId]);

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'No cuenta con turno activo de despachador asignado' });
        return;
      }

      const row = result.rows[0];
      const dowOk = (row.days_of_week || []).includes(row.current_lima_dow);
      const timeOk = row.current_lima_time >= row.start_time && row.current_lima_time <= row.end_time;
      const isShiftOpen = dowOk && timeOk;

      res.json({
        shift: row,
        isShiftOpen,
        reason: !isShiftOpen ? (dowOk ? 'Fuera de rango horario' : 'Día no programado') : 'Turno activo'
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Dispatcher Shift Error]:', err);
    res.status(500).json({ error: 'Error al consultar turno de despachador' });
  }
});

// POST /api/dispatcher/update-queue (Valida TBAC en servidor + Geovalla 100m con PostGIS)
router.post('/update-queue', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = UpdateQueueSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Parámetros inválidos', details: parseResult.error.format() });
      return;
    }

    const { stopId, delta, latitude, longitude, statusNote } = parseResult.data;

    const client = await pool.connect();
    try {
      // Llamada a la función PostgreSQL con TBAC y ST_DistanceSphere a 100m
      const query = `
        SELECT public.update_stop_queue_with_tbac(
          $1::uuid, $2::uuid, $3::int, $4::double precision, $5::double precision, $6::text
        ) AS result;
      `;
      const sqlRes = await client.query(query, [
        userId,
        stopId,
        delta,
        latitude,
        longitude,
        statusNote || null
      ]);

      const result = sqlRes.rows[0]?.result;

      if (!result?.allowed) {
        // Bloqueo de seguridad: candado horario o geovalla excedida
        res.status(403).json({
          error: 'Acción bloqueada por seguridad perimetral',
          details: result
        });
        return;
      }

      // Emisión WebSockets para actualización instantánea en el mapa de todos los usuarios
      if (io) {
        io.to('barranca_live_map').emit('stop_live_updated', {
          stopId,
          queuedCount: result.queued_vehicles_count,
          statusNote,
          updatedAt: new Date().toISOString()
        });
      }

      res.json({
        message: 'Cola vehicular actualizada exitosamente',
        data: result
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Dispatcher Queue Update Error]:', err);
    res.status(500).json({ error: 'Error procesando actualización de cola vehicular' });
  }
});

// POST /api/dispatcher/upload-photo (Asocia foto en vivo al paradero con timestamp inmutable)
router.post('/upload-photo', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { stopId, photoUrl, latitude, longitude } = req.body;

    if (!stopId || !photoUrl) {
      res.status(400).json({ error: 'stopId y photoUrl son requeridos' });
      return;
    }

    const client = await pool.connect();
    try {
      // Validar turno primero
      const valQuery = `
        SELECT public.validate_dispatcher_shift_and_geofence(
          $1::uuid, $2::uuid, $3::double precision, $4::double precision, 100.0
        ) AS val;
      `;
      const valRes = await client.query(valQuery, [userId, stopId, latitude || -10.7512, longitude || -77.7615]);
      const val = valRes.rows[0]?.val;

      if (!val?.allowed) {
        res.status(403).json({ error: 'No autorizado para subir fotos fuera del paradero o turno', details: val });
        return;
      }

      await client.query(`
        UPDATE public.stop_live_status
        SET photo_url = $1, updated_at = NOW()
        WHERE stop_id = $2;
      `, [photoUrl, stopId]);

      // Auditoría inmutable
      await client.query(`
        INSERT INTO public.audit_logs (user_id, action, details)
        VALUES ($1, 'DISPATCHER_PHOTO_UPLOAD', jsonb_build_object('stop_id', $2, 'photo_url', $3));
      `, [userId, stopId, photoUrl]);

      if (io) {
        io.to('barranca_live_map').emit('stop_photo_updated', { stopId, photoUrl });
      }

      res.json({ message: 'Fotografía en vivo verificada y publicada' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Dispatcher Photo Upload Error]:', err);
    res.status(500).json({ error: 'Error guardando fotografía del paradero' });
  }
});

export default router;
