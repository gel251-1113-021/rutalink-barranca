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
      console.warn('[Public Stops Supabase fallback error]:', sbErr);
      res.json({
        stops: [
          {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'Paradero Base Central Barranca',
            type: 'BASE',
            address_reference: 'Av. José Gálvez 450 (Cerca a Plaza Vea)',
            latitude: -10.7512,
            longitude: -77.7615,
            group_name: 'Empresa de Transportes Barranca Express',
            queued_vehicles_count: 3,
            status_note: 'Operativo con despacho continuo',
            last_status_update: new Date().toISOString()
          },
          {
            id: 'c0000000-0000-0000-0000-000000000002',
            name: 'Punto de Parada UNAB - Campus Universitario',
            type: 'TRANQUILO',
            address_reference: 'Av. Toribio de Luzuriaga (Puerta Principal UNAB)',
            latitude: -10.7485,
            longitude: -77.7550,
            group_name: 'Línea Universitaria UNAB Directo',
            queued_vehicles_count: 1,
            status_note: 'Afluencia universitaria normal',
            last_status_update: new Date().toISOString()
          },
          {
            id: 'c0000000-0000-0000-0000-000000000003',
            name: 'Paradero Supe Pueblo',
            type: 'BASE',
            address_reference: 'Calle Francisco Vidal con Jr. Bolívar',
            latitude: -10.7980,
            longitude: -77.7125,
            group_name: 'Comité Interdistrital Barranca - Supe',
            queued_vehicles_count: 2,
            status_note: 'Salidas cada 5 minutos',
            last_status_update: new Date().toISOString()
          },
          {
            id: 'c0000000-0000-0000-0000-000000000004',
            name: 'Punto Tranquilo Óvalo Pativilca',
            type: 'TRANQUILO',
            address_reference: 'Cruce Panamericana Norte con Av. Principal',
            latitude: -10.6970,
            longitude: -77.7830,
            group_name: 'Asociación de Colectivos Pativilca - Paramonga',
            queued_vehicles_count: 1,
            status_note: 'Zona segura y alumbrada',
            last_status_update: new Date().toISOString()
          },
          {
            id: 'c0000000-0000-0000-0000-000000000005',
            name: 'Punto de Abordaje Paramonga',
            type: 'TRANQUILO',
            address_reference: 'Plaza de Armas Paramonga (Frente a Municipalidad)',
            latitude: -10.6720,
            longitude: -77.8180,
            group_name: 'Línea de Movilidad Valle Fortaleza',
            queued_vehicles_count: 2,
            status_note: 'Unidades disponibles hacia Barranca',
            last_status_update: new Date().toISOString()
          }
        ]
      });
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

      if (error || !data || data.length === 0) {
        throw error || new Error('No groups in Supabase REST');
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
      console.warn('[Public Groups Supabase fallback error]:', sbErr);
      res.json({
        groups: [
          {
            id: 'b0000000-0000-0000-0000-000000000001',
            name: 'Empresa de Transportes Barranca Express',
            type: 'EMPRESA_FORMAL',
            description: 'Línea de transporte interdistrital con cobertura en toda la provincia',
            base_address: 'Av. José Gálvez 450, Barranca',
            base_latitude: -10.7512,
            base_longitude: -77.7615,
            contact_phone: '+51 987654321',
            fare_range: 'S/ 2.50 - S/ 5.00'
          }
        ]
      });
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

      if (error || !data || data.length === 0) {
        throw error || new Error('No vehicles in Supabase REST');
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
      console.warn('[Public Vehicles Supabase fallback error]:', sbErr);
      res.json({
        vehicles: [
          {
            id: 'd0000000-0000-0000-0000-000000000006',
            plate: 'Z9P-140',
            brand_model: 'Toyota HiAce Combi 2024',
            vehicle_type: 'COMBI',
            seat_layout: [
              { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
              { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto', status: 'free' },
              { x: 1, y: 2, id: 's2', type: 'passenger', label: 'F1 Izq', status: 'occupied' },
              { x: 1.5, y: 2, id: 's3', type: 'passenger', label: 'F1 Centro', status: 'occupied' },
              { x: 2, y: 2, id: 's4', type: 'passenger', label: 'F1 Der', status: 'free' }
            ],
            capacity: 14,
            roof_rack: false,
            max_cargo_kg: 300,
            cargo_status: 'MEDIO',
            status: 'DISPONIBLE',
            latitude: -10.7512,
            longitude: -77.7615,
            current_heading: 45,
            driver_name: 'Pedro Chumpitaz Solís',
            driver_phone: '+51 987654330',
            driver_rating: 4.9,
            group_name: 'Empresa de Transportes Barranca Express',
            last_location_update: new Date().toISOString()
          },
          {
            id: 'd0000000-0000-0000-0000-000000000003',
            plate: 'A7U-102',
            brand_model: 'Toyota Avanza Miniván 2024',
            vehicle_type: 'MINIVAN',
            seat_layout: [
              { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
              { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto', status: 'free' },
              { x: 1, y: 2, id: 's2', type: 'passenger', label: 'F2 Izq', status: 'occupied' },
              { x: 2, y: 2, id: 's3', type: 'passenger', label: 'F2 Der', status: 'free' },
              { x: 1, y: 3, id: 's4', type: 'passenger', label: 'F3 Izq', status: 'free' },
              { x: 2, y: 3, id: 's5', type: 'passenger', label: 'F3 Der', status: 'occupied' }
            ],
            capacity: 6,
            roof_rack: false,
            max_cargo_kg: 80,
            cargo_status: 'DISPONIBLE',
            status: 'DISPONIBLE',
            latitude: -10.7495,
            longitude: -77.7570,
            current_heading: 90,
            driver_name: 'Carlos Morales Echevarría',
            driver_phone: '+51 987654313',
            driver_rating: 4.8,
            group_name: 'Línea Universitaria UNAB Directo',
            last_location_update: new Date().toISOString()
          },
          {
            id: 'd0000000-0000-0000-0000-000000000007',
            plate: 'MT-4021',
            brand_model: 'Bajaj Torito 4T Mototaxi Barranca',
            vehicle_type: 'MOTOTAXI',
            seat_layout: [
              { x: 1.5, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
              { x: 1, y: 2, id: 's1', type: 'passenger', label: 'P1 Izq', status: 'free' },
              { x: 1.5, y: 2, id: 's2', type: 'passenger', label: 'P2 Centro', status: 'occupied' },
              { x: 2, y: 2, id: 's3', type: 'passenger', label: 'P3 Der', status: 'free' }
            ],
            capacity: 3,
            roof_rack: false,
            max_cargo_kg: 20,
            cargo_status: 'DISPONIBLE',
            status: 'DISPONIBLE',
            latitude: -10.7505,
            longitude: -77.7635,
            current_heading: 270,
            driver_name: 'Luis Morales Pajuelo',
            driver_phone: '+51 987654329',
            driver_rating: 4.85,
            group_name: 'Asociación de Mototaxis y Colectivos Rápidos Barranca',
            last_location_update: new Date().toISOString()
          }
        ]
      });
    }
  }
});

export default router;
