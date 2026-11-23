const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clean() {
  await client.connect();
  console.log('Iniciando limpieza de datos de prueba...');

  // 1. Limpiar registros transaccionales
  await client.query('DELETE FROM public.waiting_passengers;');
  console.log('✓ waiting_passengers limpio.');

  await client.query('DELETE FROM public.passenger_dropoffs;');
  console.log('✓ passenger_dropoffs limpio.');

  await client.query('DELETE FROM public.chat_messages;');
  console.log('✓ chat_messages limpio.');

  await client.query('DELETE FROM public.group_chat_messages;');
  console.log('✓ group_chat_messages limpio.');

  await client.query('DELETE FROM public.trips_and_agreements;');
  console.log('✓ trips_and_agreements limpio.');

  await client.query('DELETE FROM public.group_members;');
  console.log('✓ group_members limpio.');

  await client.query('DELETE FROM public.groups;');
  console.log('✓ groups limpio.');

  // 2. Eliminar usuarios ficticios de pruebas automáticas (test_chofer_%)
  const testUsers = await client.query("SELECT id, email FROM auth.users WHERE email LIKE 'test_chofer_%';");
  for (const u of testUsers.rows) {
    await client.query('DELETE FROM public.profiles WHERE id = $1;', [u.id]);
    await client.query('DELETE FROM auth.identities WHERE user_id = $1;', [u.id]);
    await client.query('DELETE FROM auth.users WHERE id = $1;', [u.id]);
    console.log(`✓ Eliminado usuario de prueba: ${u.email}`);
  }

  // 3. Resetear el estado de los vehículos a DISPONIBLE en Barranca Centro
  await client.query(`
    UPDATE public.vehicles
    SET status = 'DISPONIBLE',
        current_location = ST_SetSRID(ST_MakePoint(-77.7615, -10.7512), 4326),
        current_heading = 0,
        last_location_update = NOW();
  `);
  console.log('✓ Vehículos restablecidos a base Barranca Centro.');

  console.log('¡Base de datos limpiada con éxito para entorno real!');
  await client.end();
}

clean().catch(console.error);
