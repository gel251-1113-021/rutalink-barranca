import { Server as SocketIOServer, Socket } from 'socket.io';
import { supabase } from '../config/supabase.js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Memoria de control de throttling GPS: { vehicleId: { lastTime: number, lat: number, lng: number } }
const gpsThrottlingCache = new Map<string, { lastTime: number; lat: number; lng: number }>();

export function initializeSockets(io: SocketIOServer): void {
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          socket.data.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.active_role || 'PASAJERO'
          };
        }
      } catch (e) {
        // Invitado
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.id;
    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.join('barranca_live_map');

    // 1. Unirse a sala efímera de viaje o grupo
    socket.on('join_trip', (tripId: string) => {
      socket.join(`trip_${tripId}`);
    });

    socket.on('join_group', (groupId: string) => {
      socket.join(`group_${groupId}`);
    });

    // 2. Tracking GPS del Conductor con THROTTLING (5 seg / > 15m)
    socket.on('driver_gps_update', async (data: { vehicleId: string; lat: number; lng: number; heading?: number }) => {
      if (!data.vehicleId || isNaN(data.lat) || isNaN(data.lng)) return;

      const now = Date.now();
      const prev = gpsThrottlingCache.get(data.vehicleId);

      let shouldBroadcast = false;

      if (!prev) {
        shouldBroadcast = true;
      } else {
        const timeDiff = (now - prev.lastTime) / 1000; // segundos
        // Distancia aproximada en metros
        const latDiff = Math.abs(data.lat - prev.lat) * 111320;
        const lngDiff = Math.abs(data.lng - prev.lng) * 111320 * Math.cos((data.lat * Math.PI) / 180);
        const distMeters = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        // Throttling: al menos 5 segundos transcurridos O más de 15 metros desplazados
        if (timeDiff >= 5 || distMeters >= 15) {
          shouldBroadcast = true;
        }
      }

      if (shouldBroadcast) {
        gpsThrottlingCache.set(data.vehicleId, { lastTime: now, lat: data.lat, lng: data.lng });

        // Actualizar en base de datos
        try {
          const client = await pool.connect();
          try {
            await client.query(`
              UPDATE public.vehicles
              SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
                  current_heading = $3,
                  last_location_update = NOW()
              WHERE id = $4;
            `, [data.lng, data.lat, data.heading || null, data.vehicleId]);
          } finally {
            client.release();
          }
        } catch (e) {
          console.error('[Socket GPS Update Error]:', e);
        }

        // Broadcast a todos los usuarios en el mapa con interpolación suave
        io.to('barranca_live_map').emit('vehicle_moved', {
          vehicleId: data.vehicleId,
          latitude: data.lat,
          longitude: data.lng,
          heading: data.heading || 0,
          updatedAt: new Date().toISOString()
        });
      }
    });

    // 3. Control Táctil de Cabina en Vivo (< 1 seg)
    socket.on('toggle_cabin_seat', async (data: { vehicleId: string; seatLayout: any[] }) => {
      if (!data.vehicleId || !data.seatLayout) return;

      try {
        const client = await pool.connect();
        try {
          await client.query(`
            UPDATE public.vehicles
            SET seat_layout = $1::jsonb,
                last_location_update = NOW()
            WHERE id = $2;
          `, [JSON.stringify(data.seatLayout), data.vehicleId]);
        } finally {
          client.release();
        }

        // Sincronizar instantáneamente a los pasajeros
        io.to('barranca_live_map').emit('cabin_seat_updated', {
          vehicleId: data.vehicleId,
          seatLayout: data.seatLayout,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('[Socket Seat Toggle Error]:', e);
      }
    });

    // 4. Señal "Estoy esperando aquí" hacia los choferes (con lectura por voz)
    socket.on('passenger_waiting_alert', (data: { stopName: string; lat: number; lng: number; passengerName: string }) => {
      io.to('barranca_live_map').emit('passenger_waiting_signal', {
        ...data,
        speechText: `Atención conductor: Pasajero esperando en ${data.stopName}`,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      // Limpieza
    });
  });
}
