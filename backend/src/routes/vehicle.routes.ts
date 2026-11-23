import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Pool } from 'pg';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

const VehicleDesignSchema = z.object({
  plate: z.string().min(6).max(10),
  brandModel: z.string().min(3).max(50),
  vehicleType: z.enum(['SEDAN', 'SUV', 'MINIVAN', 'COMBI', 'MOTOTAXI', 'STATION_WAGON', 'AUTO']),
  seatLayout: z.array(z.any()),
  capacity: z.number().int().min(2).max(20),
  roofRack: z.boolean().default(false),
  maxCargoKg: z.number().int().min(10).max(500).default(50),
  cargoStatus: z.enum(['VACIO', 'MEDIO', 'LLENO']).default('VACIO')
});

// GET /api/vehicles/my-vehicle (Obtiene el vehículo del conductor autenticado)
router.get('/my-vehicle', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          v.id,
          v.plate,
          v.brand_model,
          v.vehicle_type,
          v.seat_layout,
          v.capacity,
          v.roof_rack,
          v.max_cargo_kg,
          v.cargo_status,
          v.status,
          ST_Y(v.current_location)::float AS latitude,
          ST_X(v.current_location)::float AS longitude,
          v.current_heading::float AS current_heading,
          v.last_location_update,
          g.name AS group_name
        FROM public.vehicles v
        LEFT JOIN public.groups g ON v.group_id = g.id
        WHERE v.owner_id = $1
        LIMIT 1;
      `;
      const result = await client.query(query, [userId]);

      if (result.rowCount === 0) {
        res.json({ vehicle: null });
        return;
      }

      res.json({ vehicle: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[My Vehicle Error]:', err);
    res.status(500).json({ error: 'Error al consultar unidad vehicular' });
  }
});

// POST /api/vehicles/save-design (Constructor 2D: Guarda o actualiza el diseño de la unidad)
router.post('/save-design', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = VehicleDesignSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Especificación de vehículo inválida', details: parseResult.error.format() });
      return;
    }

    const { plate, brandModel, vehicleType, seatLayout, capacity, roofRack, maxCargoKg, cargoStatus } = parseResult.data;

    try {
      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO public.vehicles (
            owner_id, plate, brand_model, vehicle_type, seat_layout, capacity,
            roof_rack, max_cargo_kg, cargo_status, status, current_location, last_location_update
          ) VALUES (
            $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, 'DISPONIBLE',
            ST_SetSRID(ST_MakePoint(-77.7580, -10.7500), 4326), NOW()
          )
          ON CONFLICT (plate) DO UPDATE SET
            brand_model = EXCLUDED.brand_model,
            vehicle_type = EXCLUDED.vehicle_type,
            seat_layout = EXCLUDED.seat_layout,
            capacity = EXCLUDED.capacity,
            roof_rack = EXCLUDED.roof_rack,
            max_cargo_kg = EXCLUDED.max_cargo_kg,
            cargo_status = EXCLUDED.cargo_status,
            updated_at = NOW()
          RETURNING *;
        `;

        const result = await client.query(query, [
          userId,
          plate.toUpperCase().trim(),
          brandModel,
          vehicleType,
          JSON.stringify(seatLayout),
          capacity,
          roofRack,
          maxCargoKg,
          cargoStatus
        ]);

        res.json({
          message: 'Diseño vehicular 2D guardado satisfactoriamente',
          vehicle: result.rows[0]
        });
        return;
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Save Vehicle Pool error, using Supabase client]:', poolErr);
      const cleanPlate = plate.toUpperCase().trim();
      const { data: upserted, error: sbError } = await supabase
        .from('vehicles')
        .upsert({
          owner_id: userId,
          plate: cleanPlate,
          brand_model: brandModel,
          vehicle_type: vehicleType,
          seat_layout: seatLayout,
          capacity,
          roof_rack: roofRack,
          max_cargo_kg: maxCargoKg,
          cargo_status: cargoStatus,
          status: 'DISPONIBLE',
          last_location_update: new Date().toISOString()
        }, { onConflict: 'plate' })
        .select()
        .single();

      if (sbError) {
        throw sbError;
      }

      res.json({
        message: 'Diseño vehicular 2D guardado satisfactoriamente (Supabase)',
        vehicle: upserted
      });
    }
  } catch (err: any) {
    console.error('[Save Vehicle Design Error]:', err);
    res.status(500).json({ error: err.message || 'Error al persistir diseño de unidad' });
  }
});

// PUT /api/vehicles/seats (Actualiza en tiempo real estado de un asiento: occupied / free)
router.put('/seats', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { vehicleId, seatLayout, cargoStatus } = req.body;

    if (!vehicleId || !seatLayout) {
      res.status(400).json({ error: 'vehicleId y seatLayout son obligatorios' });
      return;
    }

    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.vehicles
        SET seat_layout = $1::jsonb,
            cargo_status = COALESCE($2, cargo_status),
            last_location_update = NOW()
        WHERE id = $3 AND owner_id = $4
        RETURNING *;
      `;
      const result = await client.query(query, [JSON.stringify(seatLayout), cargoStatus || null, vehicleId, userId]);

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Vehículo no encontrado o no pertenece al usuario autenticado' });
        return;
      }

      res.json({ message: 'Cabina táctil sincronizada', vehicle: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Vehicle Seats Update Error]:', err);
    res.status(500).json({ error: 'Error sincronizando asientos de cabina' });
  }
});

export default router;
