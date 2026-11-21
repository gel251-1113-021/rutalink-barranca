import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

const CreateGroupSchema = z.object({
  name: z.string().min(3).max(100),
  type: z.enum(['EMPRESARIAL', 'COMUNITARIO']),
  description: z.string().max(500).optional(),
  baseAddress: z.string().max(200).optional(),
  baseLatitude: z.number().min(-90).max(90).optional(),
  baseLongitude: z.number().min(-180).max(180).optional(),
  contactPhone: z.string().max(20).optional(),
  fareRange: z.string().max(50).optional()
});

// GET /api/groups/my-groups
router.get('/my-groups', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          g.id,
          g.name,
          g.type,
          g.description,
          g.base_address,
          ST_Y(g.base_location)::float AS base_latitude,
          ST_X(g.base_location)::float AS base_longitude,
          g.contact_phone,
          g.fare_range,
          gm.role_in_group,
          gm.status AS member_status,
          (SELECT COUNT(*) FROM public.group_members WHERE group_id = g.id) AS total_members
        FROM public.groups g
        JOIN public.group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = $1 AND g.is_active = TRUE
        ORDER BY g.created_at DESC;
      `;
      const result = await client.query(query, [userId]);
      res.json({ groups: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[My Groups Error]:', err);
    res.status(500).json({ error: 'Error consultando grupos del usuario' });
  }
});

// POST /api/groups (Crea grupo Empresarial o Comunitario)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = CreateGroupSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Datos de grupo inválidos', details: parseResult.error.format() });
      return;
    }

    const { name, type, description, baseAddress, baseLatitude, baseLongitude, contactPhone, fareRange } = parseResult.data;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const locSql = (baseLatitude && baseLongitude)
        ? `ST_SetSRID(ST_MakePoint(${baseLongitude}, ${baseLatitude}), 4326)`
        : 'NULL';

      const insertGroupSql = `
        INSERT INTO public.groups (
          name, type, description, base_address, base_location, contact_phone, fare_range, created_by
        ) VALUES (
          $1, $2, $3, $4, ${locSql}, $5, $6, $7
        ) RETURNING *;
      `;
      const groupRes = await client.query(insertGroupSql, [
        name, type, description || null, baseAddress || null, contactPhone || null, fareRange || null, userId
      ]);

      const newGroup = groupRes.rows[0];

      // Afiliar al creador como ADMIN_EMPRESA
      await client.query(`
        INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
        VALUES ($1, $2, 'ADMIN_EMPRESA', 'ACTIVO');
      `, [newGroup.id, userId]);

      await client.query('COMMIT');

      res.status(201).json({ message: 'Grupo creado exitosamente', group: newGroup });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Create Group Error]:', err);
    res.status(500).json({ error: 'Error al registrar grupo' });
  }
});

// GET /api/groups/:id/pending-drivers (Conductores en espera de aprobación)
router.get('/:id/pending-drivers', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          gm.id AS membership_id,
          gm.user_id,
          gm.created_at AS application_date,
          p.full_name,
          p.email,
          p.phone,
          p.rating,
          v.id AS vehicle_id,
          v.plate,
          v.brand_model,
          v.vehicle_type
        FROM public.group_members gm
        JOIN public.profiles p ON gm.user_id = p.id
        LEFT JOIN public.vehicles v ON p.id = v.owner_id
        WHERE gm.group_id = $1 AND gm.status = 'EN_ESPERA'
        ORDER BY gm.created_at ASC;
      `;
      const result = await client.query(query, [groupId]);
      res.json({ pendingDrivers: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Pending Drivers Error]:', err);
    res.status(500).json({ error: 'Error al consultar conductores postulantes' });
  }
});

// POST /api/groups/:id/approve-driver (Aprobación de conductor por Admin de grupo)
router.post('/:id/approve-driver', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const { driverUserId } = req.body;

    if (!driverUserId) {
      res.status(400).json({ error: 'driverUserId es requerido' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Actualizar estado de membresía en el grupo
      await client.query(`
        UPDATE public.group_members
        SET status = 'ACTIVO', role_in_group = 'CONDUCTOR_AFILIADO'
        WHERE group_id = $1 AND user_id = $2;
      `, [groupId, driverUserId]);

      // 2. Actualizar el perfil activo del usuario
      await client.query(`
        UPDATE public.profiles
        SET active_role = 'CONDUCTOR_AFILIADO', account_status = 'ACTIVO'
        WHERE id = $1;
      `, [driverUserId]);

      // 3. Vincular vehículo del conductor al grupo
      await client.query(`
        UPDATE public.vehicles
        SET group_id = $1
        WHERE owner_id = $2;
      `, [groupId, driverUserId]);

      await client.query('COMMIT');

      res.json({ message: 'Conductor aprobado y habilitado en la flota de la empresa' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Approve Driver Error]:', err);
    res.status(500).json({ error: 'Error al procesar aprobación del conductor' });
  }
});

export default router;
