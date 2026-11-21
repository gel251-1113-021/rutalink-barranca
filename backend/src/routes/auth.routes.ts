import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(6).max(20).optional(),
  activeRole: z.enum([
    'PASAJERO',
    'CONDUCTOR_AFILIADO',
    'CONDUCTOR_INDEPENDIENTE',
    'ADMIN_EMPRESA',
    'ENCARGADO_PARADERO'
  ]).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
});

// GET /api/auth/profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, full_name, email, phone, avatar_url, active_role, account_status, 
                rating, total_trips, emergency_contact_name, emergency_contact_phone, created_at
         FROM public.profiles 
         WHERE id = $1`,
        [userId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Perfil de usuario no encontrado' });
        return;
      }

      res.json({ profile: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Profile Fetch Error]:', err);
    res.status(500).json({ error: 'Error al consultar perfil de usuario' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const parseResult = UpdateProfileSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Datos inválidos', details: parseResult.error.format() });
      return;
    }

    const { fullName, phone, activeRole, emergencyContactName, emergencyContactPhone } = parseResult.data;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE public.profiles
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             active_role = COALESCE($3, active_role),
             emergency_contact_name = COALESCE($4, emergency_contact_name),
             emergency_contact_phone = COALESCE($5, emergency_contact_phone),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [fullName, phone, activeRole, emergencyContactName, emergencyContactPhone, userId]
      );

      res.json({ message: 'Perfil actualizado exitosamente', profile: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Profile Update Error]:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// DELETE /api/auth/account (Eliminación con confirmación y borrado seguro)
router.delete('/account', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const client = await pool.connect();
    try {
      // Eliminar de auth.users (el cascade limpiará perfiles y referencias)
      await client.query('DELETE FROM auth.users WHERE id = $1', [userId]);
      res.json({ message: 'Cuenta y datos personales eliminados permanentemente del sistema' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Account Deletion Error]:', err);
    res.status(500).json({ error: 'Error durante la eliminación de cuenta' });
  }
});

export default router;
