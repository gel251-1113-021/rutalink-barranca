import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { io } from '../server.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

// GET /api/dropoffs/active (Puntos de bajada pendientes para conductores)
router.get('/active', async (_req: Request, res: Response): Promise<void> => {
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
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Dropoffs Error]:', err);
    res.status(500).json({ error: 'Error al consultar puntos de bajada' });
  }
});

// POST /api/dropoffs (Pasajero solicita "Me bajo aquí")
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { passengerId, passengerName, vehicleId, vehiclePlate, lat, lng, landmark } = req.body;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Coordenadas de bajada inválidas' });
      return;
    }

    const client = await pool.connect();
    try {
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
        passengerId || null,
        passengerName || 'Pasajero a Bordo',
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
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Create Dropoff Error]:', err);
    res.status(500).json({ error: 'Error al solicitar bajada' });
  }
});

// PATCH /api/dropoffs/:id/status (Conductor marca atendida la bajada)
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ATENDIDO' | 'CANCELADO'

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
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Update Dropoff Error]:', err);
    res.status(500).json({ error: 'Error al actualizar bajada' });
  }
});

export default router;
