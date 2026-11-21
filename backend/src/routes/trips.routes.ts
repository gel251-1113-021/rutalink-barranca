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

// GET /api/trips/history/:userId (Historial de viajes de pasajero o conductor)
router.get('/history/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          ta.id,
          ta.origin_name,
          ta.destination_name,
          ta.agreed_price,
          ta.status,
          ta.rating,
          ta.review_comment,
          ta.created_at,
          p_driver.full_name AS driver_name,
          p_pass.full_name AS passenger_name,
          v.plate AS vehicle_plate,
          v.brand_model AS vehicle_model
        FROM public.trips_and_agreements ta
        LEFT JOIN public.profiles p_driver ON ta.driver_id = p_driver.id
        LEFT JOIN public.profiles p_pass ON ta.passenger_id = p_pass.id
        LEFT JOIN public.vehicles v ON ta.vehicle_id = v.id
        WHERE ta.passenger_id = $1 OR ta.driver_id = $1
        ORDER BY ta.created_at DESC
        LIMIT 30;
      `;
      const result = await client.query(query, [userId]);

      if (result.rows.length > 0) {
        res.json({ trips: result.rows });
        return;
      }

      // Si no tiene viajes aún en base de datos, retornar viajes modelo de Barranca
      const defaultTrips = [
        {
          id: 't-demo-01',
          origin_name: 'Paradero Base Central Gálvez',
          destination_name: 'Campus Universitario UNAB (Luzuriaga)',
          agreed_price: 2.50,
          status: 'FINALIZADO',
          rating: 5,
          review_comment: 'Excelente servicio, viaje rápido y seguro.',
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          driver_name: 'Jorge Huamán Castillo',
          vehicle_plate: 'B1A-789',
          vehicle_model: 'Toyota Yaris Sedán'
        },
        {
          id: 't-demo-02',
          origin_name: 'Plaza de Supe Pueblo',
          destination_name: 'Terminal Terrestre de Barranca',
          agreed_price: 3.50,
          status: 'FINALIZADO',
          rating: 5,
          review_comment: 'Puntualidad en la salida.',
          created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
          driver_name: 'Luis Alberto Alva',
          vehicle_plate: 'T5F-330',
          vehicle_model: 'Hyundai Elantra'
        },
        {
          id: 't-demo-03',
          origin_name: 'Óvalo Pativilca (Cruce Panamericana)',
          destination_name: 'Mercado Modelo de Barranca',
          agreed_price: 4.00,
          status: 'FINALIZADO',
          rating: 4,
          review_comment: 'Todo conforme.',
          created_at: new Date(Date.now() - 3600000 * 52).toISOString(),
          driver_name: 'Ricardo Pantoja Gómez',
          vehicle_plate: 'D2K-881',
          vehicle_model: 'Nissan Versa'
        }
      ];

      res.json({ trips: defaultTrips });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Trip History Error]:', err);
    res.status(500).json({ error: 'Error al consultar historial de viajes' });
  }
});

export default router;
