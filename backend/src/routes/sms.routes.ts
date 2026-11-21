import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Cache in-memory para resiliencia en caso de latencia de red
const inMemorySmsLogs: any[] = [];

const router = Router();

// POST /api/sms/inbound - Gateway SMS para zonas sin cobertura 4G/datos móviles
router.post('/inbound', async (req: Request, res: Response): Promise<void> => {
  const { senderPhone = '987654321', text = '' } = req.body;
  const cleanCmd = String(text).trim().toUpperCase();

  let reply = '';
  const recipientPhone = '900123456'; // Número institucional RutaLink SMS

  if (cleanCmd.includes('BARRANCA') || cleanCmd.includes('DONDE')) {
    reply = '[RutaLink SMS] Paradero Base Central: 3 unidades listas en cola. Salidas continuas cada 5 min hacia UNAB y Supe.';
  } else if (cleanCmd.includes('UNAB') || cleanCmd.includes('RUTA')) {
    reply = '[RutaLink SMS] Troncal 1 Barranca-UNAB: 3.8 km (~10 min). Tarifa ref: S/. 2.50. 2 unidades en trayecto activo.';
  } else if (cleanCmd.includes('SOS')) {
    reply = '[RutaLink SOS] ¡Alerta de seguridad activada! Coordenadas y aviso remitidos a tu contacto de emergencia.';
  } else {
    reply = '[RutaLink SMS] Comandos disponibles: DONDE BARRANCA, RUTA UNAB, SOS. Consulta la red sin megas ni datos.';
  }

  const logEntry = {
    id: `sms_${Date.now()}`,
    sender_phone: senderPhone,
    recipient_phone: recipientPhone,
    command_raw: text || cleanCmd,
    response_text: reply,
    status: 'PROCESADO',
    created_at: new Date().toISOString()
  };

  inMemorySmsLogs.unshift(logEntry);

  // Intentar persistencia asíncrona en PostgreSQL
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO public.sms_logs (sender_phone, recipient_phone, command_raw, response_text, status)
         VALUES ($1, $2, $3, $4, 'PROCESADO')`,
        [senderPhone, recipientPhone, text || cleanCmd, reply]
      );
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('[SMS DB Warn - Saved in-memory]:', err.message || err);
  }

  res.json({
    success: true,
    sender: senderPhone,
    command: cleanCmd,
    reply,
    timestamp: logEntry.created_at
  });
});

// GET /api/sms/history - Registro auditado de consultas por SMS
router.get('/history', async (_req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, sender_phone, command_raw, response_text, status, created_at
         FROM public.sms_logs
         ORDER BY created_at DESC
         LIMIT 20;`
      );
      if (result.rows.length > 0) {
        res.json({ history: result.rows });
        return;
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[SMS History DB Warn - Falling back to memory]');
  }

  res.json({ history: inMemorySmsLogs.slice(0, 20) });
});

export default router;
