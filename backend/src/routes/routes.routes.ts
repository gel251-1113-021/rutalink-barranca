import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

// GET /api/routes (Obtiene rutas formales con coordenadas GeoJSON)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          r.id,
          r.name,
          r.origin_name,
          r.destination_name,
          r.distance_km,
          r.estimated_duration_min,
          ST_AsGeoJSON(r.waypoints)::json AS geojson,
          g.name AS group_name
        FROM public.routes r
        LEFT JOIN public.groups g ON r.group_id = g.id
        WHERE r.is_active = TRUE
        ORDER BY r.distance_km ASC;
      `;
      const result = await client.query(query);
      res.json({ routes: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Routes Error]:', err);
    res.status(500).json({ error: 'Error al consultar rutas viales' });
  }
});

// GET /api/routes/bbox (Filtrado espacial por Bounding Box con PostGIS)
router.get('/bbox', async (req: Request, res: Response): Promise<void> => {
  try {
    const minLng = parseFloat(req.query.minLng as string) || -77.9;
    const minLat = parseFloat(req.query.minLat as string) || -10.9;
    const maxLng = parseFloat(req.query.maxLng as string) || -77.6;
    const maxLat = parseFloat(req.query.maxLat as string) || -10.6;

    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM public.get_vehicles_in_bbox($1, $2, $3, $4);
      `;
      const result = await client.query(query, [minLng, minLat, maxLng, maxLat]);
      res.json({ vehicles: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[BBox Error]:', err);
    res.status(500).json({ error: 'Error al consultar vehículos en Bounding Box' });
  }
});

export default router;
