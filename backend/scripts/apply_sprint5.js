const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Aplicando script 05_sprint5_mobile_cockpit_chat.sql en Supabase...');
    const sqlPath = path.resolve(__dirname, '../../docs/sql/05_sprint5_mobile_cockpit_chat.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('✓ Script 05 ejecutado exitosamente en Supabase.');
  } catch (err) {
    console.error('Error aplicando Script 05:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
