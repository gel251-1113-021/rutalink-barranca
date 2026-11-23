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

// Presencia simultánea en tiempo real de todos los usuarios (Choferes y Pasajeros transmitiendo)
export interface LiveUserPresence {
  userId: string;
  userName: string;
  role: 'PASAJERO' | 'CONDUCTOR';
  lat: number;
  lng: number;
  heading?: number;
  driverStatus?: 'DISPONIBLE' | 'PAUSA';
  plate?: string;
  brandModel?: string;
  phone?: string;
  vehicleType?: string;
  socketId: string;
  lastSeen: number;
}

const liveUsersPresence = new Map<string, LiveUserPresence>();

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
    const handshakeUserId = socket.data.user?.id || (socket.handshake.auth?.userId as string | undefined);
    if (handshakeUserId) {
      socket.join(`user_${handshakeUserId}`);
      socket.data.userId = handshakeUserId;
    }

    socket.join('barranca_live_map');

    // Enviar al recién conectado el snapshot de todos los usuarios transmitiendo simultáneamente
    socket.emit('user_presence_updated', Array.from(liveUsersPresence.values()));

    // Registro explícito del cliente para garantizar sala privada user_{userId}
    socket.on('register_user', (data: { userId: string; role?: string; name?: string }) => {
      if (data?.userId) {
        socket.data.userId = data.userId;
        socket.data.userName = data.name;
        socket.data.role = data.role;
        socket.join(`user_${data.userId}`);
      }
    });

    // 0. Inicio de transmisión en vivo simultánea de cualquier usuario (Conductor o Pasajero)
    socket.on('user_start_broadcast', (presence: {
      userId: string;
      userName: string;
      role: 'PASAJERO' | 'CONDUCTOR';
      lat: number;
      lng: number;
      heading?: number;
      driverStatus?: 'DISPONIBLE' | 'PAUSA';
      plate?: string;
      brandModel?: string;
      phone?: string;
      vehicleType?: string;
    }) => {
      if (!presence.userId || isNaN(presence.lat) || isNaN(presence.lng)) return;

      const record: LiveUserPresence = {
        ...presence,
        socketId: socket.id,
        lastSeen: Date.now()
      };
      liveUsersPresence.set(presence.userId, record);
      socket.data.userId = presence.userId;

      // Notificar a todos en el mapa provincial
      io.to('barranca_live_map').emit('user_presence_updated', Array.from(liveUsersPresence.values()));
    });

    // Actualización continua de posición en vivo
    socket.on('user_update_coords', (data: {
      userId: string;
      lat: number;
      lng: number;
      heading?: number;
      driverStatus?: 'DISPONIBLE' | 'PAUSA';
    }) => {
      if (!data.userId || isNaN(data.lat) || isNaN(data.lng)) return;

      const existing = liveUsersPresence.get(data.userId);
      if (existing) {
        existing.lat = data.lat;
        existing.lng = data.lng;
        if (data.heading !== undefined) existing.heading = data.heading;
        if (data.driverStatus) existing.driverStatus = data.driverStatus;
        existing.lastSeen = Date.now();
        liveUsersPresence.set(data.userId, existing);

        io.to('barranca_live_map').emit('user_presence_single_moved', existing);
      }
    });

    // Detener transmisión en vivo
    socket.on('user_stop_broadcast', (data: { userId: string }) => {
      if (data?.userId) {
        liveUsersPresence.delete(data.userId);
        io.to('barranca_live_map').emit('user_presence_removed', { userId: data.userId });
      }
    });

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

    // 5. Flujo Bidireccional en Tiempo Real de Negociación y Pactación de Carreras
    socket.on('ride_request_broadcast', (data: {
      passengerId: string;
      passengerName: string;
      origin: string;
      destination: string;
      proposedFare: string;
      passengerCount: number;
      hasLuggage: boolean;
      userCoords?: { lat: number; lng: number } | null;
      driverId?: string; // Si es carrera directa
    }) => {
      const payload = {
        ...data,
        requestId: `ride_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
      };

      if (data.driverId) {
        // Enviar a la sala privada del chofer específico
        io.to(`user_${data.driverId}`).emit('ride_request_incoming', payload);
      } else {
        // Enviar a todos los conductores activos en el mapa provincial
        io.to('barranca_live_map').emit('ride_request_incoming', payload);
      }
    });

    // Chofer Acepta o Contraoferta una Carrera
    socket.on('ride_response_from_driver', (data: {
      requestId: string;
      passengerId: string;
      driverId: string;
      driverName: string;
      plate: string;
      brandModel: string;
      driverPhone?: string;
      status: 'ACCEPTED' | 'COUNTER_OFFER' | 'REJECTED';
      offeredFare: string;
      distanceMin?: number;
    }) => {
      // Notificar al pasajero en su sala privada de forma inmediata
      io.to(`user_${data.passengerId}`).emit('ride_response_received', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Pasajero confirma y pacta con el chofer (Genera PIN de seguridad)
    socket.on('ride_agreement_finalized', (data: {
      requestId: string;
      passengerId: string;
      driverId: string;
      finalFare: string;
      securityPin: string;
      pickupLocation: string;
      destination: string;
    }) => {
      const room = `trip_${data.requestId}`;
      socket.join(room);

      // Notificar a ambas partes
      io.to(`user_${data.driverId}`).emit('ride_confirmed_driver', data);
      io.to(`user_${data.passengerId}`).emit('ride_confirmed_passenger', data);
    });

    // 6. Publicación y Sincronización Inmediata de Estado de Conducción del Chofer
    socket.on('driver_publish_status', (data: {
      vehicleId: string;
      status: string;
      note: string;
      driverName?: string;
    }) => {
      io.to('barranca_live_map').emit('vehicle_status_changed', {
        vehicleId: data.vehicleId,
        status: data.status,
        note: data.note,
        updatedAt: new Date().toISOString()
      });
    });

    // 7. Mensajería Instantánea de Grupos en Vivo
    socket.on('send_group_message', (data: {
      groupId: string;
      message: any;
    }) => {
      if (data.groupId && data.message) {
        io.to(`group_${data.groupId}`).emit('new_group_message', data.message);
      }
    });

    // 8. Mensajería Privada 1 a 1 de Negociación y Carrera Pactada en Tiempo Real
    socket.on('send_ride_chat', (data: {
      targetUserId: string;
      message: any;
      fromUserId?: string;
    }) => {
      if (data?.targetUserId && data?.message) {
        io.to(`user_${data.targetUserId}`).emit('ride_chat_message', data.message);
      }
    });

    socket.on('disconnect', () => {
      // Limpieza de presencia si el usuario estaba transmitiendo
      const uid = socket.data.userId;
      if (uid && liveUsersPresence.has(uid)) {
        liveUsersPresence.delete(uid);
        io.to('barranca_live_map').emit('user_presence_removed', { userId: uid });
      }
    });
  });
}
