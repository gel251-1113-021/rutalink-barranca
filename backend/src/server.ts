import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import dispatcherRoutes from './routes/dispatcher.routes.js';
import groupRoutes from './routes/group.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import routesRoutes from './routes/routes.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import { initializeSockets } from './sockets/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Socket.io para tiempo real
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSockets(io);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'RutaLink Backend API',
    scope: 'Provincia de Barranca / UNAB',
    sprint: 'Sprint 3 (Realtime WebSockets, OSRM Routes, Cabin & Agreements)',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/dispatcher', dispatcherRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/trips', tripsRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` [RutaLink API] Servidor activo en puerto ${PORT}`);
    console.log(` [RutaLink S3] WebSockets, Rutas OSRM y Acuerdos 1a1`);
    console.log(`===================================================`);
  });
}

export { app, server };
