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
import smsRoutes from './routes/sms.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import chatRoutes from './routes/chat.routes.js';
import dropoffRoutes from './routes/dropoff.routes.js';
import driverRoutes from './routes/driver.routes.js';
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
const handleHealth = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'healthy',
    system: 'RutaLink Backend API',
    scope: 'Provincia de Barranca / UNAB',
    sprint: 'Sprint 5 (Producción, Rutas Geográficas WGS84, Alta Disponibilidad)',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/dispatcher', dispatcherRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dropoffs', dropoffRoutes);
app.use('/api/driver', driverRoutes);

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
