import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { io } from '../server.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

// GET /api/chat/groups/:groupId (Listar historial de mensajes estilo WhatsApp)
router.get('/groups/:groupId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          id,
          group_id,
          sender_id,
          sender_name,
          sender_role,
          message,
          message_type,
          created_at
        FROM public.group_chat_messages
        WHERE group_id = $1
        ORDER BY created_at ASC
        LIMIT 100;
      `;
      const result = await client.query(query, [groupId]);
      res.json({ messages: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Chat Error]:', err);
    res.status(500).json({ error: 'Error al consultar mensajes de chat' });
  }
});

// POST /api/chat/groups/:groupId (Enviar mensaje grupal en tiempo real - Exclusivo usuarios autenticados)
router.post('/groups/:groupId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { message, messageType } = req.body;
    const senderId = req.user?.id;
    const senderRole = req.user?.role || 'PASAJERO';

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'El mensaje no puede estar vacío' });
      return;
    }

    const client = await pool.connect();
    try {
      // Obtener el nombre del usuario desde public.profiles
      const profileRes = await client.query('SELECT full_name FROM public.profiles WHERE id = $1', [senderId]);
      const senderName = profileRes.rows[0]?.full_name || req.user?.email || 'Usuario Verificado';

      const insertQuery = `
        INSERT INTO public.group_chat_messages (
          group_id, sender_id, sender_name, sender_role, message, message_type
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING *;
      `;
      const result = await client.query(insertQuery, [
        groupId,
        senderId,
        senderName,
        senderRole,
        message.trim(),
        messageType || 'TEXTO'
      ]);

      const newMessage = result.rows[0];

      // Emitir en tiempo real a la sala del grupo y al mapa general
      if (io) {
        io.to(`group_${groupId}`).emit('group_chat_message', newMessage);
        io.to('barranca_live_map').emit('group_chat_message', newMessage);
      }

      res.status(201).json({ message: newMessage });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Send Chat Error]:', err);
    res.status(500).json({ error: 'Error al enviar mensaje grupal' });
  }
});

// DELETE /api/chat/groups/:groupId (Eliminar canal de chat y mensajes)
router.delete('/groups/:groupId', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM public.group_chat_messages WHERE group_id = $1;', [groupId]);
      await client.query('DELETE FROM public.group_members WHERE group_id = $1;', [groupId]);
      await client.query('DELETE FROM public.groups WHERE id = $1;', [groupId]).catch(() => null);

      if (io) {
        io.to(`group_${groupId}`).emit('group_deleted', { groupId });
      }

      res.json({ message: 'Canal de chat eliminado permanentemente', groupId });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Delete Chat Error]:', err);
    res.status(500).json({ error: 'Error al eliminar canal de chat' });
  }
});

export default router;
