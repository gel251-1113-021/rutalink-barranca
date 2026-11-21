const path = require('path');
const { Client } = require(path.join(__dirname, '../backend/node_modules/pg'));
const fs = require('fs');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL para Script 04...');
    const sql = fs.readFileSync(path.join(__dirname, '../docs/sql/04_sprint4_offgrid_analytics.sql'), 'utf-8');
    await client.query(sql);
    console.log('Script 04 ejecutado correctamente.');
    
    // Probar función analítica
    const test = await client.query('SELECT public.get_daily_transport_metrics() AS metrics;');
    console.log('Métricas de prueba:', test.rows[0].metrics);
  } catch (err) {
    console.error('Error aplicando Script 04:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
