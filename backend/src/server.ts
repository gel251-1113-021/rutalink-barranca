import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import { initializeSockets } from './sockets/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000',
  'https://rutalink.vercel.app'
];

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permisivo en desarrollo local / Vercel preview
    }
  },
  credentials: true
}));

app.use(express.json());

// Socket.io para tiempo real
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSockets(io);

// Health check para Render y monitorización
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'RutaLink Backend API',
    scope: 'Provincia de Barranca / UNAB',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` [RutaLink API] Servidor activo en puerto ${PORT}`);
    console.log(` [RutaLink Realtime] Socket.io inicializado`);
    console.log(`===================================================`);
  });
}

export { app, server, io };
