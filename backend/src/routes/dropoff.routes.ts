import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { io } from '../server.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

dotenv.config();

let isPoolAvailable = Boolean(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 2000
});

const router = Router();

// GET /api/dropoffs/active (Puntos de bajada pendientes para conductores)
router.get('/active', async (_req: Request, res: Response): Promise<void> => {
  if (isPoolAvailable) {
    try {
      const client = await pool.connect();
      try {
        const query = `
          SELECT 
            id,
            passenger_id,
            passenger_name,
            vehicle_id,
            vehicle_plate,
            ST_Y(dropoff_location) AS latitude,
            ST_X(dropoff_location) AS longitude,
            landmark_reference,
            status,
            created_at
          FROM public.passenger_dropoffs
          WHERE status = 'PENDIENTE'
          ORDER BY created_at DESC
          LIMIT 50;
        `;
        const result = await client.query(query);
        res.json({ dropoffs: result.rows });
        return;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err.code === 'ENETUNREACH' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
        isPoolAvailable = false;
      }
    }
  }

  // Fallback de alta velocidad directo a Supabase HTTPS
  try {
    const { data, error } = await supabase
      .from('passenger_dropoffs')
      .select('*')
      .eq('status', 'PENDIENTE')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ dropoffs: data || [] });
  } catch (sbErr) {
    console.error('[Dropoffs Supabase fallback Error]:', sbErr);
    res.status(500).json({ error: 'Error al consultar puntos de bajada' });
  }
});

// POST /api/dropoffs (Pasajero autenticado solicita "Me bajo aquí")
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const passengerId = req.user?.id;
    const { vehicleId, vehiclePlate, lat, lng, landmark } = req.body;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Coordenadas de bajada inválidas' });
      return;
    }

    if (isPoolAvailable) {
      try {
        const client = await pool.connect();
        try {
          const profileRes = await client.query('SELECT full_name FROM public.profiles WHERE id = $1', [passengerId]);
          const passengerName = profileRes.rows[0]?.full_name || req.user?.email || 'Pasajero a Bordo';

          const query = `
            INSERT INTO public.passenger_dropoffs (
              passenger_id, passenger_name, vehicle_id, vehicle_plate, dropoff_location, landmark_reference, status
            ) VALUES (
              $1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, 'PENDIENTE'
            ) RETURNING 
              id, passenger_id, passenger_name, vehicle_id, vehicle_plate,
              ST_Y(dropoff_location) AS latitude, ST_X(dropoff_location) AS longitude,
              landmark_reference, status, created_at;
          `;
          const result = await client.query(query, [
            passengerId,
            passengerName,
            vehicleId || null,
            vehiclePlate || 'EN_RUTA',
            lng,
            lat,
            landmark || 'Esquina / Paradero Solicitado'
          ]);

          const newDropoff = result.rows[0];

          if (io) {
            io.to('barranca_live_map').emit('dropoff_requested', {
              ...newDropoff,
              alertText: `Parada solicitada: ${newDropoff.landmark_reference}`
            });
          }

          res.status(201).json({ dropoff: newDropoff });
          return;
        } finally {
          client.release();
        }
      } catch (poolErr: any) {
        if (poolErr.code === 'ENETUNREACH' || poolErr.code === 'ETIMEDOUT' || poolErr.code === 'ECONNREFUSED') {
          isPoolAvailable = false;
        }
      }
    }

    // Fallback Supabase REST
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', passengerId).single();
    const passengerName = profile?.full_name || req.user?.email || 'Pasajero a Bordo';

    const { data, error } = await supabase
      .from('passenger_dropoffs')
      .insert([{
        passenger_id: passengerId,
        passenger_name: passengerName,
        vehicle_id: vehicleId || null,
        vehicle_plate: vehiclePlate || 'EN_RUTA',
        landmark_reference: landmark || 'Esquina / Paradero Solicitado',
        status: 'PENDIENTE'
      }])
      .select()
      .single();

    if (error) throw error;

    if (io) {
      io.to('barranca_live_map').emit('dropoff_requested', {
        ...data,
        latitude: lat,
        longitude: lng,
        alertText: `Parada solicitada: ${data.landmark_reference}`
      });
    }

    res.status(201).json({ dropoff: { ...data, latitude: lat, longitude: lng } });
  } catch (err) {
    console.error('[Create Dropoff Error]:', err);
    res.status(500).json({ error: 'Error al solicitar bajada' });
  }
});

// PATCH /api/dropoffs/:id/status (Conductor marca atendida o cancelada la bajada)
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ATENDIDO' | 'CANCELADO'

    if (isPoolAvailable) {
      try {
        const client = await pool.connect();
        try {
          const query = `
            UPDATE public.passenger_dropoffs
            SET status = $1
            WHERE id = $2
            RETURNING id, status;
          `;
          const result = await client.query(query, [status || 'ATENDIDO', id]);
          if (result.rows.length === 0) {
            res.status(404).json({ error: 'Solicitud no encontrada' });
            return;
          }

          if (io) {
            io.to('barranca_live_map').emit('dropoff_updated', {
              id,
              status: result.rows[0].status
            });
          }

          res.json({ dropoff: result.rows[0] });
          return;
        } finally {
          client.release();
        }
      } catch (poolErr: any) {
        if (poolErr.code === 'ENETUNREACH' || poolErr.code === 'ETIMEDOUT' || poolErr.code === 'ECONNREFUSED') {
          isPoolAvailable = false;
        }
      }
    }

    // Fallback Supabase
    const { data, error } = await supabase
      .from('passenger_dropoffs')
      .update({ status: status || 'ATENDIDO' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (io) {
      io.to('barranca_live_map').emit('dropoff_updated', {
        id,
        status: data.status
      });
    }

    res.json({ dropoff: data });
  } catch (err) {
    console.error('[Update Dropoff Error]:', err);
    res.status(500).json({ error: 'Error al actualizar bajada' });
  }
});

// DELETE /api/dropoffs/:id (Cancelar y eliminar bajada solicitada)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (isPoolAvailable) {
      try {
        const client = await pool.connect();
        try {
          await client.query(`UPDATE public.passenger_dropoffs SET status = 'CANCELADO' WHERE id = $1`, [id]);
          if (io) {
            io.to('barranca_live_map').emit('dropoff_updated', { id, status: 'CANCELADO' });
          }
          res.json({ message: 'Parada cancelada exitosamente', id });
          return;
        } finally {
          client.release();
        }
      } catch (poolErr: any) {
        if (poolErr.code === 'ENETUNREACH' || poolErr.code === 'ETIMEDOUT' || poolErr.code === 'ECONNREFUSED') {
          isPoolAvailable = false;
        }
      }
    }

    // Fallback Supabase
    const { error } = await supabase.from('passenger_dropoffs').update({ status: 'CANCELADO' }).eq('id', id);
    if (error) throw error;
    if (io) {
      io.to('barranca_live_map').emit('dropoff_updated', { id, status: 'CANCELADO' });
    }
    res.json({ message: 'Parada cancelada exitosamente', id });
  } catch (err) {
    console.error('[Cancel Dropoff Error]:', err);
    res.status(500).json({ error: 'Error al cancelar la bajada' });
  }
});

export default router;
