import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Pool } from 'pg';
import { supabase } from '../config/supabase.js';
import { io } from '../server.js';
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
  fareRange: z.string().max(50).optional(),
  isPrivate: z.boolean().optional(),
  accessCode: z.string().optional()
});

// GET /api/groups/my-groups
router.get('/my-groups', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    try {
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
        return;
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[My Groups Pool, fallback to Supabase client]:', poolErr);
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select(`
          role_in_group,
          status,
          groups (
            id, name, type, description, base_address, contact_phone, fare_range, is_active, created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVO');

      if (error) throw error;
      const mapped = (memberships || [])
        .filter((m: any) => m.groups && m.groups.is_active !== false)
        .map((m: any) => ({
          ...m.groups,
          role_in_group: m.role_in_group,
          member_status: m.status,
          total_members: 1
        }));

      res.json({ groups: mapped });
      return;
    }
  } catch (err) {
    console.error('[My Groups Error]:', err);
    res.status(500).json({ error: 'Error consultando grupos del usuario' });
  }
});

// POST /api/groups (Crea grupo Empresarial o Comunitario - Creador queda como Admin)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = CreateGroupSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Datos de grupo inválidos', details: parseResult.error.format() });
      return;
    }

    const { name, type, description, baseAddress, baseLatitude, baseLongitude, contactPhone, fareRange } = parseResult.data;

    try {
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
        const adminRole = type === 'COMUNITARIO' ? 'ADMIN_GRUPO_PASAJEROS' : 'ADMIN_EMPRESA';

        await client.query(`
          INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
          VALUES ($1, $2, $3, 'ACTIVO');
        `, [newGroup.id, userId, adminRole]);

        await client.query(`
          UPDATE public.profiles
          SET active_role = $1
          WHERE id = $2 AND active_role = 'PASAJERO';
        `, [adminRole, userId]);

        await client.query('COMMIT');

        res.status(201).json({ 
          message: 'Grupo creado exitosamente. Has sido asignado como Administrador.', 
          group: newGroup,
          adminRole
        });
        return;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Create Group Pool, fallback to Supabase client]:', poolErr);
      const adminRole = type === 'COMUNITARIO' ? 'ADMIN_GRUPO_PASAJEROS' : 'ADMIN_EMPRESA';

      const { data: newGroup, error: groupErr } = await supabase
        .from('groups')
        .insert({
          name,
          type,
          description: description || null,
          base_address: baseAddress || null,
          contact_phone: contactPhone || null,
          fare_range: fareRange || null,
          created_by: userId,
          is_active: true
        })
        .select()
        .single();

      if (groupErr) throw groupErr;

      await supabase.from('group_members').insert({
        group_id: newGroup.id,
        user_id: userId,
        role_in_group: adminRole,
        status: 'ACTIVO'
      });

      await supabase.from('profiles').update({ active_role: adminRole }).eq('id', userId);

      res.status(201).json({
        message: 'Grupo creado exitosamente (Supabase). Has sido asignado como Administrador.',
        group: newGroup,
        adminRole
      });
      return;
    }
  } catch (err: any) {
    console.error('[Create Group Error]:', err);
    res.status(500).json({ error: err?.message || 'Error al registrar grupo' });
  }
});

// GET /api/groups/:id/members (Lista de miembros del grupo con sus roles)
router.get('/:id/members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          gm.id AS membership_id,
          gm.user_id,
          gm.role_in_group,
          gm.status,
          gm.created_at AS joined_at,
          p.full_name,
          p.email,
          p.phone,
          p.rating,
          p.avatar_url
        FROM public.group_members gm
        JOIN public.profiles p ON gm.user_id = p.id
        WHERE gm.group_id = $1
        ORDER BY 
          CASE 
            WHEN gm.role_in_group IN ('ADMIN_EMPRESA', 'ADMIN_GRUPO_PASAJEROS') THEN 1
            WHEN gm.role_in_group = 'ENCARGADO_PARADERO' THEN 2
            WHEN gm.role_in_group = 'CONDUCTOR_AFILIADO' THEN 3
            ELSE 4
          END ASC,
          gm.created_at ASC;
      `;
      const result = await client.query(query, [groupId]);
      res.json({ members: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Group Members Error]:', err);
    res.status(500).json({ error: 'Error al consultar miembros del grupo' });
  }
});

// POST /api/groups/:id/members (Unirse o agregar miembro al grupo)
router.post('/:id/members', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const { userIdToAdd, roleInGroup = 'PASAJERO' } = req.body;
    const targetUserId = userIdToAdd || req.user?.id;

    const client = await pool.connect();
    try {
      // Verificar si ya es miembro
      const existing = await client.query(
        'SELECT id FROM public.group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, targetUserId]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        res.json({ message: 'El usuario ya es miembro de este grupo' });
        return;
      }

      await client.query(`
        INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
        VALUES ($1, $2, $3, 'ACTIVO')
      `, [groupId, targetUserId, roleInGroup]);

      res.status(201).json({ message: 'Miembro agregado exitosamente al grupo' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Add Member Error]:', err);
    res.status(500).json({ error: 'Error al agregar miembro al grupo' });
  }
});

// PUT /api/groups/:id/members/:memberId/promote (Designar Co-Administrador estilo WhatsApp)
router.put('/:id/members/:memberId/promote', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.memberId;
    const requesterId = req.user?.id;

    const client = await pool.connect();
    try {
      // 1. Verificar que el solicitante es Administrador del grupo
      const adminCheck = await client.query(`
        SELECT role_in_group 
        FROM public.group_members 
        WHERE group_id = $1 AND user_id = $2 AND role_in_group IN ('ADMIN_EMPRESA', 'ADMIN_GRUPO_PASAJEROS');
      `, [groupId, requesterId]);

      if (adminCheck.rowCount === 0) {
        res.status(403).json({ error: 'Solo los administradores del grupo pueden designar co-administradores' });
        return;
      }

      // 2. Determinar el rol admin adecuado según el tipo de grupo
      const groupRes = await client.query('SELECT type FROM public.groups WHERE id = $1', [groupId]);
      const groupType = groupRes.rows[0]?.type;
      const targetAdminRole = groupType === 'COMUNITARIO' ? 'ADMIN_GRUPO_PASAJEROS' : 'ADMIN_EMPRESA';

      // 3. Ascender al miembro
      await client.query(`
        UPDATE public.group_members 
        SET role_in_group = $1
        WHERE group_id = $2 AND (id = $3 OR user_id = $3);
      `, [targetAdminRole, groupId, memberId]);

      res.json({ message: 'Usuario promovido a Co-Administrador del grupo con éxito' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Promote Co-Admin Error]:', err);
    res.status(500).json({ error: 'Error al promover administrador' });
  }
});

// PUT /api/groups/:id/members/:memberId/demote (Revocar Co-Administrador)
router.put('/:id/members/:memberId/demote', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.memberId;
    const requesterId = req.user?.id;

    const client = await pool.connect();
    try {
      const adminCheck = await client.query(`
        SELECT role_in_group 
        FROM public.group_members 
        WHERE group_id = $1 AND user_id = $2 AND role_in_group IN ('ADMIN_EMPRESA', 'ADMIN_GRUPO_PASAJEROS');
      `, [groupId, requesterId]);

      if (adminCheck.rowCount === 0) {
        res.status(403).json({ error: 'Solo los administradores pueden revocar roles' });
        return;
      }

      await client.query(`
        UPDATE public.group_members 
        SET role_in_group = 'PASAJERO'
        WHERE group_id = $1 AND (id = $2 OR user_id = $2);
      `, [groupId, memberId]);

      res.json({ message: 'Rol de administrador revocado' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Demote Co-Admin Error]:', err);
    res.status(500).json({ error: 'Error al revocar administrador' });
  }
});

// POST /api/groups/:id/assign-dispatcher
// ESTRICTA REGLA: Solo un ADMIN_EMPRESA con paradero físico verificado y miembros activos puede designar un Despachador
router.post('/:id/assign-dispatcher', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const requesterId = req.user?.id;
    const { targetUserId, stopId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ error: 'targetUserId es requerido' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verificar que el solicitante es ADMIN_EMPRESA en este grupo
      const adminCheck = await client.query(`
        SELECT role_in_group 
        FROM public.group_members 
        WHERE group_id = $1 AND user_id = $2 AND role_in_group = 'ADMIN_EMPRESA';
      `, [groupId, requesterId]);

      if (adminCheck.rowCount === 0) {
        res.status(403).json({ 
          error: 'Acceso Denegado: Solo el Administrador de una Empresa de Transporte puede designar despachadores.' 
        });
        await client.query('ROLLBACK');
        return;
      }

      // 2. Verificar que el grupo tenga un punto físico estable (base_address o base_location)
      const groupCheck = await client.query(`
        SELECT id, name, base_address, base_location
        FROM public.groups
        WHERE id = $1 AND (base_address IS NOT NULL OR base_location IS NOT NULL);
      `, [groupId]);

      if (groupCheck.rowCount === 0) {
        res.status(400).json({ 
          error: 'Operación denegada: La empresa debe contar con un paradero físico verificado para asignar un despachador.' 
        });
        await client.query('ROLLBACK');
        return;
      }

      // 3. Verificar que tenga miembros activos en la flota
      const membersCount = await client.query(`
        SELECT COUNT(*) AS total 
        FROM public.group_members 
        WHERE group_id = $1 AND status = 'ACTIVO';
      `, [groupId]);

      if (parseInt(membersCount.rows[0].total) < 2) {
        res.status(400).json({ 
          error: 'La empresa debe tener al menos miembros y flota activa registrada para habilitar un puesto de despacho.' 
        });
        await client.query('ROLLBACK');
        return;
      }

      // 4. Actualizar o insertar la membresía como ENCARGADO_PARADERO
      await client.query(`
        INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
        VALUES ($1, $2, 'ENCARGADO_PARADERO', 'ACTIVO')
        ON CONFLICT (group_id, user_id) 
        DO UPDATE SET role_in_group = 'ENCARGADO_PARADERO', status = 'ACTIVO';
      `, [groupId, targetUserId]);

      // 5. Actualizar el perfil activo del usuario
      await client.query(`
        UPDATE public.profiles
        SET active_role = 'ENCARGADO_PARADERO'
        WHERE id = $1;
      `, [targetUserId]);

      await client.query('COMMIT');

      res.json({ 
        message: 'Despachador designado con éxito. Ahora tiene permisos para gestionar la cola del paradero oficial.' 
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Assign Dispatcher Error]:', err);
    res.status(500).json({ error: 'Error asignando despachador' });
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

// DELETE /api/groups/:id (Eliminación definitiva del grupo / comité - Solo creador o administrador)
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const userId = req.user?.id;

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Verificar si el usuario es creador o admin del grupo
        const checkGroup = await client.query(`
          SELECT g.created_by, gm.role_in_group
          FROM public.groups g
          LEFT JOIN public.group_members gm ON g.id = gm.group_id AND gm.user_id = $2
          WHERE g.id = $1;
        `, [groupId, userId]);

        if (checkGroup.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({ error: 'Grupo no encontrado' });
          return;
        }

        const groupRow = checkGroup.rows[0];
        const isCreator = groupRow.created_by === userId;
        const isAdmin = ['ADMIN_EMPRESA', 'ADMIN_GRUPO_PASAJEROS'].includes(groupRow.role_in_group);

        if (!isCreator && !isAdmin) {
          await client.query('ROLLBACK');
          res.status(403).json({ error: 'Solo el creador o administrador puede eliminar este grupo' });
          return;
        }

        // 2. Limpieza de tablas dependientes en cascada
        await client.query('DELETE FROM public.group_chat_messages WHERE group_id = $1;', [groupId]);
        await client.query('DELETE FROM public.group_members WHERE group_id = $1;', [groupId]);
        await client.query('DELETE FROM public.stops WHERE group_id = $1;', [groupId]).catch(() => null);
        await client.query('UPDATE public.vehicles SET group_id = NULL WHERE group_id = $1;', [groupId]).catch(() => null);
        await client.query('DELETE FROM public.groups WHERE id = $1;', [groupId]);

        await client.query('COMMIT');

        if (io) {
          io.to(`group_${groupId}`).emit('group_deleted', { groupId });
          io.to('barranca_live_map').emit('group_deleted', { groupId });
        }

        res.json({ message: 'Grupo y canales asociados eliminados permanentemente', groupId });
        return;
      } catch (poolInnerErr) {
        await client.query('ROLLBACK');
        throw poolInnerErr;
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Delete Group Pool, fallback to Supabase]:', poolErr);
      await supabase.from('group_chat_messages').delete().eq('group_id', groupId);
      await supabase.from('group_members').delete().eq('group_id', groupId);
      await supabase.from('groups').delete().eq('id', groupId);

      if (io) {
        io.to(`group_${groupId}`).emit('group_deleted', { groupId });
        io.to('barranca_live_map').emit('group_deleted', { groupId });
      }

      res.json({ message: 'Grupo eliminado permanentemente', groupId });
    }
  } catch (err) {
    console.error('[Delete Group Error]:', err);
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

// DELETE /api/groups/:id/leave (Abandonar grupo como miembro)
router.delete('/:id/leave', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groupId = req.params.id;
    const userId = req.user?.id;

    try {
      const client = await pool.connect();
      try {
        await client.query(`
          DELETE FROM public.group_members
          WHERE group_id = $1 AND user_id = $2;
        `, [groupId, userId]);
        res.json({ message: 'Has abandonado el grupo exitosamente', groupId });
        return;
      } finally {
        client.release();
      }
    } catch (poolErr) {
      console.warn('[Leave Group Pool fallback to Supabase]:', poolErr);
      await supabase.from('group_members').delete().match({ group_id: groupId, user_id: userId });
      res.json({ message: 'Has abandonado el grupo exitosamente', groupId });
    }
  } catch (err) {
    console.error('[Leave Group Error]:', err);
    res.status(500).json({ error: 'Error al abandonar grupo' });
  }
});

export default router;
