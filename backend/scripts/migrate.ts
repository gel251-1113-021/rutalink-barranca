import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL no está definido en .env');
    process.exit(1);
  }

  console.log('--- Iniciando migración de base de datos para RutaLink ---');
  console.log('Conectando a Supabase PostgreSQL...');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Conexión establecida con éxito.');

    const sqlPath = path.resolve(__dirname, '../../docs/sql/01_schema_rutalink.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Archivo SQL no encontrado en: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`Leyendo script maestro: ${sqlPath} (${sql.length} bytes)...`);

    await client.query(sql);
    console.log('✓ Esquema maestro, extensiones, tipos ENUM, tablas e índices GIST creados exitosamente.');

    // Verificar tablas creadas
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tablas registradas en esquema public:');
    res.rows.forEach(r => console.log(` - ${r.table_name}`));

    console.log('--- Migración completada con éxito ---');
  } catch (error) {
    console.error('ERROR durante la migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
