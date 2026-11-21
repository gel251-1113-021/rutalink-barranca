import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

// GET /api/stops (Público / Modo Invitado - Conteo en cola vehicular y coordenadas)
router.get('/stops', async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          s.id,
          s.name,
          s.type,
          s.address_reference,
          ST_Y(s.location) AS latitude,
          ST_X(s.location) AS longitude,
          s.group_id,
          g.name AS group_name,
          COALESCE(sls.queued_vehicles_count, 0) AS queued_vehicles_count,
          sls.status_note,
          sls.photo_url,
          sls.updated_at AS last_status_update
        FROM public.stops s
        LEFT JOIN public.groups g ON s.group_id = g.id
        LEFT JOIN public.stop_live_status sls ON s.id = sls.stop_id
        WHERE s.is_active = TRUE
        ORDER BY s.type DESC, s.name ASC;
      `;
      const result = await client.query(query);
      res.json({ stops: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Public Stops Error]:', err);
    res.status(500).json({ error: 'Error al consultar paraderos' });
  }
});

// GET /api/groups (Público / Modo Invitado - Información de empresas y comités)
router.get('/groups', async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          id,
          name,
          type,
          description,
          base_address,
          ST_Y(base_location) AS base_latitude,
          ST_X(base_location) AS base_longitude,
          contact_phone,
          fare_range
        FROM public.groups
        WHERE is_active = TRUE
        ORDER BY name ASC;
      `;
      const result = await client.query(query);
      res.json({ groups: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Public Groups Error]:', err);
    res.status(500).json({ error: 'Error al consultar grupos' });
  }
});

// GET /api/vehicles (Público / Modo Invitado - Unidades activas con layout 2D de asientos)
router.get('/vehicles', async (_req: Request, res: Response): Promise<void> => {
  try {
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
          ST_Y(v.current_location) AS latitude,
          ST_X(v.current_location) AS longitude,
          v.current_heading,
          v.last_location_update,
          p.full_name AS driver_name,
          p.rating AS driver_rating,
          g.name AS group_name
        FROM public.vehicles v
        JOIN public.profiles p ON v.owner_id = p.id
        LEFT JOIN public.groups g ON v.group_id = g.id
        WHERE v.status != 'FUERA_SERVICIO'
        ORDER BY v.last_location_update DESC;
      `;
      const result = await client.query(query);
      res.json({ vehicles: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Public Vehicles Error]:', err);
    res.status(500).json({ error: 'Error al consultar unidades en circulación' });
  }
});

export default router;
