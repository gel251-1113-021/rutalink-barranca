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

// POST /api/driver/status (Actualizar estado de conducción en 1 toque)
// status: 'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO'
// contextualNote: 'Conduciendo ahora' | 'Esperando pasajeros en paradero' | 'Carro lleno' | 'Descansando'
router.post('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, driverId, status, contextualNote } = req.body;

    if (!vehicleId || !status) {
      res.status(400).json({ error: 'Faltan parámetros requeridos (vehicleId, status)' });
      return;
    }

    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.vehicles
        SET status = $1,
            last_location_update = NOW()
        WHERE id = $2
        RETURNING id, plate, brand_model, status;
      `;
      const result = await client.query(query, [status, vehicleId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Vehículo no encontrado' });
        return;
      }

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
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Driver Status Error]:', err);
    res.status(500).json({ error: 'Error al actualizar estado del conductor' });
  }
});

// POST /api/driver/seats (Actualizar distribución y disponibilidad de asientos en 1 toque)
router.post('/seats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, seatLayout, capacity } = req.body;

    if (!vehicleId || !Array.isArray(seatLayout)) {
      res.status(400).json({ error: 'Faltan datos de asientos' });
      return;
    }

    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.vehicles
        SET seat_layout = $1::jsonb,
            capacity = COALESCE($2, capacity),
            last_location_update = NOW()
        WHERE id = $3
        RETURNING id, plate, seat_layout, capacity, status;
      `;
      const result = await client.query(query, [JSON.stringify(seatLayout), capacity || null, vehicleId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Vehículo no encontrado' });
        return;
      }

      const updated = result.rows[0];

      // Contar asientos ocupados vs libres
      const passengerSeats = seatLayout.filter((s: any) => s.type !== 'driver');
      const occupiedCount = passengerSeats.filter((s: any) => s.status === 'occupied').length;
      const freeCount = passengerSeats.length - occupiedCount;

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
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Driver Seats Error]:', err);
    res.status(500).json({ error: 'Error al actualizar asientos' });
  }
});

export default router;
