import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { io } from '../server.js';
import { supabase } from '../config/supabase.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

// POST /api/driver/status (Actualizar estado de conducción en 1 toque)
// status: 'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO'
// contextualNote: 'Conduciendo ahora' | 'Esperando pasajeros en paradero' | 'Carro lleno' | 'Descansando'
router.post('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, plate, driverId, status, contextualNote } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Falta parámetro requerido: status' });
      return;
    }

    try {
      const client = await pool.connect();
      try {
        const query = `
          UPDATE public.vehicles
          SET status = $1,
              last_location_update = NOW()
          WHERE id = $2 OR plate = $3
          RETURNING id, plate, brand_model, status;
        `;
        const result = await client.query(query, [status, vehicleId || null, plate || '']);

        if (result.rows.length > 0) {
          const updated = result.rows[0];

          if (io) {
            io.to('barranca_live_map').emit('vehicle_status_changed', {
              vehicleId: updated.id,
              plate: updated.plate,
              status: updated.status,
              contextualNote: contextualNote || 'Estado actualizado',
              updatedAt: new Date().toISOString()
            });
          }

          res.json({ vehicle: updated, contextualNote });
          return;
        }
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Driver Status Pool, fallback to Supabase]:', poolErr);
    }

    // Fallback con cliente REST de Supabase
    try {
      let query = supabase.from('vehicles').update({
        status,
        last_location_update: new Date().toISOString()
      });

      if (vehicleId) {
        query = query.eq('id', vehicleId);
      } else if (plate) {
        query = query.eq('plate', plate);
      }

      const { data: updated, error } = await query.select('id, plate, brand_model, status').maybeSingle();

      if (io) {
        io.to('barranca_live_map').emit('vehicle_status_changed', {
          vehicleId: updated?.id || vehicleId || 'temp',
          plate: updated?.plate || plate || 'EN_RUTA',
          status,
          contextualNote: contextualNote || 'Estado actualizado',
          updatedAt: new Date().toISOString()
        });
      }

      res.json({ vehicle: updated || { id: vehicleId, status }, contextualNote });
      return;
    } catch (sbErr) {
      console.warn('[Driver Status Supabase warning]:', sbErr);
      if (io) {
        io.to('barranca_live_map').emit('vehicle_status_changed', {
          vehicleId: vehicleId || 'temp',
          plate: plate || 'EN_RUTA',
          status,
          contextualNote: contextualNote || 'Estado actualizado',
          updatedAt: new Date().toISOString()
        });
      }
      res.json({ success: true, status, contextualNote });
    }
  } catch (err: any) {
    console.error('[Driver Status Error]:', err);
    res.status(500).json({ error: 'Error al actualizar estado del conductor' });
  }
});

// POST /api/driver/seats (Actualizar distribución y disponibilidad de asientos en 1 toque)
router.post('/seats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, plate, seatLayout, capacity } = req.body;

    if (!Array.isArray(seatLayout)) {
      res.status(400).json({ error: 'Faltan datos de asientos' });
      return;
    }

    const passengerSeats = seatLayout.filter((s: any) => s.type !== 'driver');
    const occupiedCount = passengerSeats.filter((s: any) => s.status === 'occupied').length;
    const freeCount = passengerSeats.length - occupiedCount;

    try {
      const client = await pool.connect();
      try {
        const query = `
          UPDATE public.vehicles
          SET seat_layout = $1::jsonb,
              capacity = COALESCE($2, capacity),
              last_location_update = NOW()
          WHERE id = $3 OR plate = $4
          RETURNING id, plate, seat_layout, capacity, status;
        `;
        const result = await client.query(query, [
          JSON.stringify(seatLayout),
          capacity || null,
          vehicleId || null,
          plate || ''
        ]);

        if (result.rows.length > 0) {
          const updated = result.rows[0];

          if (io) {
            io.to('barranca_live_map').emit('cabin_seat_updated', {
              vehicleId: updated.id,
              plate: updated.plate,
              seatLayout: updated.seat_layout,
              occupiedCount,
              freeCount,
              updatedAt: new Date().toISOString()
            });
          }

          res.json({
            vehicle: updated,
            occupiedCount,
            freeCount
          });
          return;
        }
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Driver Seats Pool, fallback to Supabase]:', poolErr);
    }

    // Fallback con cliente REST de Supabase
    try {
      let query = supabase.from('vehicles').update({
        seat_layout: seatLayout,
        capacity: capacity || undefined,
        last_location_update: new Date().toISOString()
      });

      if (vehicleId) {
        query = query.eq('id', vehicleId);
      } else if (plate) {
        query = query.eq('plate', plate);
      }

      const { data: updated } = await query.select('id, plate, seat_layout, capacity, status').maybeSingle();

      if (io) {
        io.to('barranca_live_map').emit('cabin_seat_updated', {
          vehicleId: updated?.id || vehicleId || 'temp',
          plate: updated?.plate || plate || 'EN_RUTA',
          seatLayout,
          occupiedCount,
          freeCount,
          updatedAt: new Date().toISOString()
        });
      }

      res.json({
        vehicle: updated || { id: vehicleId, seat_layout: seatLayout },
        occupiedCount,
        freeCount
      });
      return;
    } catch (sbErr) {
      console.warn('[Driver Seats Supabase warning]:', sbErr);
      if (io) {
        io.to('barranca_live_map').emit('cabin_seat_updated', {
          vehicleId: vehicleId || 'temp',
          plate: plate || 'EN_RUTA',
          seatLayout,
          occupiedCount,
          freeCount,
          updatedAt: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        occupiedCount,
        freeCount
      });
    }
  } catch (err: any) {
    console.error('[Driver Seats Error]:', err);
    res.status(500).json({ error: 'Error al actualizar asientos' });
  }
});

export default router;
