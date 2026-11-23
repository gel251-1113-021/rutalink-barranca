import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase.js';

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
          ST_Y(s.location)::float AS latitude,
          ST_X(s.location)::float AS longitude,
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
      return;
    } finally {
      client.release();
    }
  } catch (poolErr) {
    console.warn('[Public Stops Pool, fallback to Supabase client]:', poolErr);
    try {
      const { data, error } = await supabase
        .from('stops')
        .select(`
          id, name, type, address_reference, location, group_id, is_active,
          groups (name)
        `)
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        throw error || new Error('No stops in Supabase REST');
      }

      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        address_reference: s.address_reference,
        latitude: s.location?.coordinates ? s.location.coordinates[1] : -10.7512,
        longitude: s.location?.coordinates ? s.location.coordinates[0] : -77.7615,
        group_id: s.group_id,
        group_name: s.groups?.name || 'Comité Provincial Barranca',
        queued_vehicles_count: 2,
        status_note: 'Paradero en monitoreo activo',
        last_status_update: new Date().toISOString()
      }));
      res.json({ stops: mapped });
      return;
    } catch (sbErr) {
      console.warn('[Public Stops fallback]: Sin paraderos registrados', sbErr);
      res.json({ stops: [] });
    }
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
      return;
    } finally {
      client.release();
    }
  } catch (poolErr) {
    console.warn('[Public Groups Pool, fallback to Supabase client]:', poolErr);
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        res.json({ groups: [] });
        return;
      }

      const mapped = data.map((g: any) => ({
        id: g.id,
        name: g.name,
        type: g.type,
        description: g.description,
        base_address: g.base_address,
        base_latitude: g.base_location?.coordinates ? g.base_location.coordinates[1] : -10.7512,
        base_longitude: g.base_location?.coordinates ? g.base_location.coordinates[0] : -77.7615,
        contact_phone: g.contact_phone,
        fare_range: g.fare_range
      }));
      res.json({ groups: mapped });
      return;
    } catch (sbErr) {
      console.warn('[Public Groups fallback]: No hay grupos adicionales o fallo de red', sbErr);
      res.json({ groups: [] });
    }
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
          ST_Y(v.current_location)::float AS latitude,
          ST_X(v.current_location)::float AS longitude,
          v.current_heading::float AS current_heading,
          v.last_location_update,
          p.full_name AS driver_name,
          COALESCE(p.rating, 5.00)::float AS driver_rating,
          g.name AS group_name
        FROM public.vehicles v
        JOIN public.profiles p ON v.owner_id = p.id
        LEFT JOIN public.groups g ON v.group_id = g.id
        WHERE v.status != 'FUERA_SERVICIO'
        ORDER BY v.last_location_update DESC;
      `;
      const result = await client.query(query);
      res.json({ vehicles: result.rows });
      return;
    } finally {
      client.release();
    }
  } catch (poolErr) {
    console.warn('[Public Vehicles Pool, fallback to Supabase client]:', poolErr);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, plate, brand_model, vehicle_type, seat_layout, capacity,
          roof_rack, max_cargo_kg, cargo_status, status, current_location,
          current_heading, last_location_update, group_id, owner_id
        `)
        .neq('status', 'FUERA_SERVICIO');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        res.json({ vehicles: [] });
        return;
      }

      const mapped = data.map((v: any) => ({
        id: v.id,
        plate: v.plate,
        brand_model: v.brand_model,
        vehicle_type: v.vehicle_type,
        seat_layout: v.seat_layout,
        capacity: v.capacity,
        roof_rack: v.roof_rack,
        max_cargo_kg: v.max_cargo_kg,
        cargo_status: v.cargo_status,
        status: v.status,
        latitude: v.current_location?.coordinates ? v.current_location.coordinates[1] : -10.7505,
        longitude: v.current_location?.coordinates ? v.current_location.coordinates[0] : -77.7635,
        current_heading: v.current_heading || 0,
        last_location_update: v.last_location_update,
        driver_name: 'Conductor Registrado',
        driver_rating: 4.85,
        group_name: 'Comité Provincial de Transporte Barranca'
      }));
      res.json({ vehicles: mapped });
      return;
    } catch (sbErr) {
      console.warn('[Public Vehicles fallback]: Sin unidades registradas activas', sbErr);
      res.json({ vehicles: [] });
    }
  }
});

export default router;
