import { Server as SocketIOServer, Socket } from 'socket.io';
import { supabase } from '../config/supabase.js';

export function initializeSockets(io: SocketIOServer): void {
  // Middleware de autenticación opcional para WebSockets (permite invitados y valida tokens de registrados)
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
        console.warn('[Socket Auth] Token inválido en handshake, conectando como invitado');
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const isAuth = !!socket.data.user;
    const userId = socket.data.user?.id || 'invitado';

    // Canal general del mapa de Barranca
    socket.join('barranca_live_map');

    // Suscripción a grupo
    socket.on('join_group', (groupId: string) => {
      socket.join(`group_${groupId}`);
    });

    // Suscripción a paradero
    socket.on('join_stop', (stopId: string) => {
      socket.join(`stop_${stopId}`);
    });

    socket.on('disconnect', () => {
      // Desconexión limpia
    });
  });
}
