import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Pool } from 'pg';
import { io } from '../server.js';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const router = Router();

const CreateAgreementSchema = z.object({
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  originName: z.string().min(2),
  destinationName: z.string().min(2),
  agreedPrice: z.number().positive(),
  originLat: z.number().optional(),
  originLng: z.number().optional(),
  destLat: z.number().optional(),
  destLng: z.number().optional()
});

// POST /api/trips/agreements (Crea sala efímera 1 a 1 para pactar viaje con independiente)
router.post('/agreements', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const passengerId = req.user?.id;
    const parseResult = CreateAgreementSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: 'Parámetros del acuerdo inválidos', details: parseResult.error.format() });
      return;
    }

    const { driverId, vehicleId, originName, destinationName, agreedPrice, originLat, originLng, destLat, destLng } = parseResult.data;

    const client = await pool.connect();
    try {
      const originLoc = (originLat && originLng) ? `ST_SetSRID(ST_MakePoint(${originLng}, ${originLat}), 4326)` : 'NULL';
      const destLoc = (destLat && destLng) ? `ST_SetSRID(ST_MakePoint(${destLng}, ${destLat}), 4326)` : 'NULL';

      const query = `
        INSERT INTO public.trips_and_agreements (
          passenger_id, driver_id, vehicle_id, origin_name, destination_name,
          agreed_price, origin_location, destination_location, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, ${originLoc}, ${destLoc}, 'PACTADO'
        ) RETURNING *;
      `;

      const result = await client.query(query, [
        passengerId, driverId, vehicleId || null, originName, destinationName, agreedPrice
      ]);

      const agreement = result.rows[0];

      // Notificar al conductor por WebSocket
      if (io) {
        io.to(`user_${driverId}`).emit('new_trip_agreement', {
          tripId: agreement.id,
          passengerName: req.user?.email?.split('@')[0],
          originName,
          destinationName,
          agreedPrice
        });
      }

      res.status(201).json({ message: 'Acuerdo de viaje creado exitosamente', agreement });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Create Agreement Error]:', err);
    res.status(500).json({ error: 'Error al generar acuerdo de viaje' });
  }
});

// GET /api/trips/:id/messages (Mensajes de sala efímera 1 a 1)
router.get('/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tripId = req.params.id;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          cm.id,
          cm.sender_id,
          cm.message,
          cm.created_at,
          p.full_name AS sender_name,
          p.active_role AS sender_role
        FROM public.chat_messages cm
        JOIN public.profiles p ON cm.sender_id = p.id
        WHERE cm.trip_id = $1
        ORDER BY cm.created_at ASC;
      `;
      const result = await client.query(query, [tripId]);
      res.json({ messages: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Trip Messages Error]:', err);
    res.status(500).json({ error: 'Error al consultar mensajes del acuerdo' });
  }
});

// POST /api/trips/:id/messages (Envía mensaje a la sala efímera 1 a 1)
router.post('/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const tripId = req.params.id;
    const userId = req.user?.id;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: 'Mensaje no puede estar vacío' });
      return;
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO public.chat_messages (trip_id, sender_id, message)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await client.query(query, [tripId, userId, message.trim()]);
      const newMsg = result.rows[0];

      if (io) {
        io.to(`trip_${tripId}`).emit('trip_message_received', {
          ...newMsg,
          sender_name: req.user?.email?.split('@')[0]
        });
      }

      res.status(201).json({ message: 'Mensaje enviado', data: newMsg });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Send Trip Message Error]:', err);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

export default router;
