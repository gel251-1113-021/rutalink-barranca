const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

const USERS = [
  // 1. Administrador General
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin.barranca@rutalink.pe',
    password: 'RutaLink2026Admin!',
    fullName: 'Carlos Mendoza Ramos',
    phone: '+51 987654321',
    role: 'ADMIN_EMPRESA',
    rating: 5.0
  },
  // 2. Despachadores de Paradero
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'despachador.supe@rutalink.pe',
    password: 'RutaLink2026Desp!',
    fullName: 'Manuel Silva Bazalar',
    phone: '+51 987654322',
    role: 'ENCARGADO_PARADERO',
    rating: 4.9
  },
  {
    id: 'a0000000-0000-0000-0000-000000000012',
    email: 'despachador.barranca@rutalink.pe',
    password: 'RutaLink2026Desp!',
    fullName: 'Elena Ramos Tolentino',
    phone: '+51 987654312',
    role: 'ENCARGADO_PARADERO',
    rating: 5.0
  },
  // 3. Choferes Afiliados a Comités y Categorías de Vehículos
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'chofer.sedan@rutalink.pe',
    password: 'RutaLink2026Sedan!',
    fullName: 'Jorge Huamán Castillo',
    phone: '+51 987654323',
    role: 'CONDUCTOR_AFILIADO',
    rating: 4.8
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'chofer.combi@rutalink.pe',
    password: 'RutaLink2026Combi!',
    fullName: 'Pedro Chumpitaz Solís',
    phone: '+51 987654330',
    role: 'CONDUCTOR_AFILIADO',
    rating: 4.9
  },
  {
    id: 'a0000000-0000-0000-0000-000000000013',
    email: 'chofer.minivan@rutalink.pe',
    password: 'RutaLink2026Minivan!',
    fullName: 'Carlos Morales Echevarría',
    phone: '+51 987654313',
    role: 'CONDUCTOR_AFILIADO',
    rating: 4.95
  },
  {
    id: 'a0000000-0000-0000-0000-000000000014',
    email: 'chofer.supe@rutalink.pe',
    password: 'RutaLink2026Chofer!',
    fullName: 'Luis Alberto Alva',
    phone: '+51 987654314',
    role: 'CONDUCTOR_AFILIADO',
    rating: 4.7
  },
  // 4. Choferes Independientes
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'chofer.probox@rutalink.pe',
    password: 'RutaLink2026Probox!',
    fullName: 'Walter Rosales Díaz',
    phone: '+51 987654324',
    role: 'CONDUCTOR_INDEPENDIENTE',
    rating: 4.7
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'chofer.mototaxi@rutalink.pe',
    password: 'RutaLink2026Moto!',
    fullName: 'Luis Morales Pajuelo',
    phone: '+51 987654329',
    role: 'CONDUCTOR_INDEPENDIENTE',
    rating: 4.85
  },
  {
    id: 'a0000000-0000-0000-0000-000000000015',
    email: 'chofer.expreso@rutalink.pe',
    password: 'RutaLink2026Indep!',
    fullName: 'Ricardo Pantoja Gómez',
    phone: '+51 987654315',
    role: 'CONDUCTOR_INDEPENDIENTE',
    rating: 4.85
  },
  // 5. Pasajeros (Estudiantes, Comerciantes, Vecinos)
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'estudiante.unab@rutalink.pe',
    password: 'RutaLink2026Estudiante!',
    fullName: 'Lucía Fernández Vega',
    phone: '+51 987654325',
    role: 'PASAJERO',
    rating: 5.0
  },
  {
    id: 'a0000000-0000-0000-0000-000000000016',
    email: 'pasajero.pativilca@rutalink.pe',
    password: 'RutaLink2026Pasajero!',
    fullName: 'Mateo Salazar Ríos',
    phone: '+51 987654316',
    role: 'PASAJERO',
    rating: 4.9
  },
  {
    id: 'a0000000-0000-0000-0000-000000000017',
    email: 'pasajera.mercado@rutalink.pe',
    password: 'RutaLink2026Pasajero!',
    fullName: 'Rosa Quispe Blas',
    phone: '+51 987654317',
    role: 'PASAJERO',
    rating: 5.0
  },
  {
    id: 'a0000000-0000-0000-0000-000000000018',
    email: 'pasajero.supe@rutalink.pe',
    password: 'RutaLink2026Pasajero!',
    fullName: 'Diego Valenzuela Cruz',
    phone: '+51 987654318',
    role: 'PASAJERO',
    rating: 4.8
  }
];

const GROUPS = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    type: 'EMPRESARIAL',
    description: 'Empresa concesionaria formal de transporte de pasajeros entre Barranca centro, Ciudad Universitaria UNAB y distrito de Supe.',
    base_address: 'Av. José Gálvez 450, Barranca',
    lng: -77.7615,
    lat: -10.7512,
    phone: '+51 987654321',
    fare: 'S/. 2.50 - S/. 4.00'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Comunidad Universitaria UNAB - Viajes Compartidos',
    type: 'COMUNITARIO',
    description: 'Red comunitaria de estudiantes, docentes y personal de la Universidad Nacional de Barranca para compartir movilidad y coordinar retornos seguros.',
    base_address: 'Campus UNAB - Av. Toribio de Luzuriaga',
    lng: -77.7550,
    lat: -10.7485,
    phone: '+51 987654325',
    fare: 'S/. 1.50 - S/. 2.50 (Tarifa Estudiantil)'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Línea Expreso Pativilca - Paramonga - Barranca',
    type: 'EMPRESARIAL',
    description: 'Asociación de transportistas interdistritales del corredor norte de la provincia de Barranca.',
    base_address: 'Óvalo Pativilca - Cruce Panamericana Norte',
    lng: -77.7845,
    lat: -10.6970,
    phone: '+51 987654315',
    fare: 'S/. 3.00 - S/. 5.00'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Asociación de Mototaxis y Colectivos Rápidos Barranca',
    type: 'COMUNITARIO',
    description: 'Grupo barrial de traslados rápidos hacia mercados, terminal terrestre y playas de Barranca.',
    base_address: 'Plaza de Armas de Barranca',
    lng: -77.7600,
    lat: -10.7525,
    phone: '+51 987654324',
    fare: 'S/. 2.00 - S/. 3.50'
  }
];

const VEHICLES = [
  // 1. SEDÁN: Toyota Yaris (4 asientos)
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    ownerId: 'a0000000-0000-0000-0000-000000000003',
    groupId: 'b0000000-0000-0000-0000-000000000001',
    plate: 'B1A-789',
    brand: 'Toyota Yaris Sedán 2023',
    type: 'SEDAN',
    capacity: 4,
    roofRack: true,
    maxCargo: 45,
    status: 'DISPONIBLE',
    lng: -77.7580,
    lat: -10.7500,
    heading: 85.0
  },
  // 2. COMBI: Toyota HiAce (14 asientos)
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    ownerId: 'a0000000-0000-0000-0000-000000000006',
    groupId: 'b0000000-0000-0000-0000-000000000001',
    plate: 'Z9P-140',
    brand: 'Toyota HiAce Combi 2024',
    type: 'COMBI',
    capacity: 14,
    roofRack: true,
    maxCargo: 150,
    status: 'DISPONIBLE',
    lng: -77.7630,
    lat: -10.7535,
    heading: 120.0
  },
  // 3. MINIVÁN: Toyota Avanza (6 asientos)
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    ownerId: 'a0000000-0000-0000-0000-000000000013',
    groupId: 'b0000000-0000-0000-0000-000000000001',
    plate: 'A7U-102',
    brand: 'Toyota Avanza Miniván 2024',
    type: 'MINIVAN',
    capacity: 6,
    roofRack: true,
    maxCargo: 80,
    status: 'DISPONIBLE',
    lng: -77.7550,
    lat: -10.7485,
    heading: 45.0
  },
  // 4. STATION WAGON / PROBOX: Toyota Probox con Parrilla (4 asientos + 120kg carga)
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    ownerId: 'a0000000-0000-0000-0000-000000000004',
    groupId: 'b0000000-0000-0000-0000-000000000004',
    plate: 'P4R-550',
    brand: 'Toyota Probox Station Wagon con Parrilla',
    type: 'STATION_WAGON',
    capacity: 4,
    roofRack: true,
    maxCargo: 120,
    status: 'DISPONIBLE',
    lng: -77.7595,
    lat: -10.7510,
    heading: 180.0
  },
  // 5. MOTOTAXI: Bajaj Torito (3 pasajeros)
  {
    id: 'd0000000-0000-0000-0000-000000000007',
    ownerId: 'a0000000-0000-0000-0000-000000000007',
    groupId: 'b0000000-0000-0000-0000-000000000004',
    plate: 'MT-4021',
    brand: 'Bajaj Torito 4T Mototaxi Barranca',
    type: 'MOTOTAXI',
    capacity: 3,
    roofRack: false,
    maxCargo: 20,
    status: 'DISPONIBLE',
    lng: -77.7600,
    lat: -10.7525,
    heading: 270.0
  }
];

async function seed() {
  await client.connect();
  console.log('--- INICIANDO SIEMBRA DE FLOTA COMPLETA Y COMUNIDADES EN BARRANCA ---');

  // 1. Usuarios
  for (const u of USERS) {
    console.log(`Sembrando usuario: ${u.fullName} (${u.role})...`);
    await client.query(`
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        email_change_token_current, phone_change, phone_change_token, reauthentication_token,
        is_sso_user, is_anonymous
      ) VALUES (
        $1, '00000000-0000-0000-0000-000000000000', $2,
        crypt($3, gen_salt('bf')), NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', $4::text, 'phone', $5::text, 'active_role', $6::text),
        'authenticated', 'authenticated', NOW(), NOW(),
        '', '', '', '', '', '', '', '', false, false
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = crypt($3, gen_salt('bf')),
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        confirmation_token = COALESCE(auth.users.confirmation_token, ''),
        recovery_token = COALESCE(auth.users.recovery_token, ''),
        updated_at = NOW();
    `, [u.id, u.email, u.password, u.fullName, u.phone, u.role]);

    await client.query(`
      INSERT INTO public.profiles (
        id, full_name, email, phone, active_role, account_status, rating
      ) VALUES (
        $1, $2, $3, $4, $5, 'ACTIVO', $6
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        active_role = EXCLUDED.active_role,
        rating = EXCLUDED.rating,
        updated_at = NOW();
    `, [u.id, u.fullName, u.email, u.phone, u.role, u.rating]);
  }
  console.log('✓ 12 Usuarios sembrados con perfiles asignados.');

  // 2. Grupos
  for (const g of GROUPS) {
    console.log(`Sembrando grupo: ${g.name}...`);
    await client.query(`
      INSERT INTO public.groups (
        id, name, type, description, base_address, base_location, contact_phone, fare_range, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, 'a0000000-0000-0000-0000-000000000001'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        fare_range = EXCLUDED.fare_range,
        base_address = EXCLUDED.base_address,
        updated_at = NOW();
    `, [g.id, g.name, g.type, g.description, g.base_address, g.lng, g.lat, g.phone, g.fare]);
  }
  console.log('✓ 4 Grupos (Empresariales y Comunitarios) sembrados.');

  // 3. Membresías en grupos
  const MEMBERSHIPS = [
    // Comité 1
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000001', role: 'ADMIN_EMPRESA' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000002', role: 'ENCARGADO_PARADERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000012', role: 'ENCARGADO_PARADERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000003', role: 'CONDUCTOR_AFILIADO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000006', role: 'CONDUCTOR_AFILIADO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000013', role: 'CONDUCTOR_AFILIADO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000014', role: 'CONDUCTOR_AFILIADO' },
    // UNAB Carpooling
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000005', role: 'PASAJERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000016', role: 'PASAJERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000013', role: 'CONDUCTOR_AFILIADO' },
    // Expreso Pativilca
    { groupId: 'b0000000-0000-0000-0000-000000000003', userId: 'a0000000-0000-0000-0000-000000000015', role: 'CONDUCTOR_INDEPENDIENTE' },
    { groupId: 'b0000000-0000-0000-0000-000000000003', userId: 'a0000000-0000-0000-0000-000000000016', role: 'PASAJERO' },
    // Asociación de Mototaxis y Colectivos Rápidos
    { groupId: 'b0000000-0000-0000-0000-000000000004', userId: 'a0000000-0000-0000-0000-000000000004', role: 'CONDUCTOR_INDEPENDIENTE' },
    { groupId: 'b0000000-0000-0000-0000-000000000004', userId: 'a0000000-0000-0000-0000-000000000007', role: 'CONDUCTOR_INDEPENDIENTE' }
  ];

  for (const m of MEMBERSHIPS) {
    await client.query(`
      INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
      VALUES ($1, $2, $3, 'ACTIVO')
      ON CONFLICT (group_id, user_id) DO UPDATE SET
        role_in_group = EXCLUDED.role_in_group,
        status = 'ACTIVO';
    `, [m.groupId, m.userId, m.role]);
  }
  console.log('✓ Membresías de grupos asociadas.');

  // Asegurar valores enum para vehicle_type
  try {
    await client.query(`ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'MOTOTAXI';`);
    await client.query(`ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'STATION_WAGON';`);
  } catch (err) {
    console.log('Aviso sobre enum vehicle_type:', err.message);
  }

  // 4. Flota de Vehículos
  for (const v of VEHICLES) {
    let layout;
    if (v.type === 'MOTOTAXI') {
      layout = [
        { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1.5, y: 1 },
        { id: 's1', label: 'P1 Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
        { id: 's2', label: 'P2 Centro', type: 'passenger', status: 'occupied', x: 1.5, y: 2 },
        { id: 's3', label: 'P3 Der', type: 'passenger', status: 'free', x: 2, y: 2 }
      ];
    } else if (v.type === 'MINIVAN') {
      layout = [
        { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied', x: 1, y: 1 },
        { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 2, y: 1 },
        { id: 's2', label: 'A2 Intermedio', type: 'passenger', status: 'occupied', x: 1, y: 2 },
        { id: 's3', label: 'A3 Intermedio', type: 'passenger', status: 'free', x: 2, y: 2 },
        { id: 's4', label: 'A4 Atrás', type: 'passenger', status: 'free', x: 1, y: 3 },
        { id: 's5', label: 'A5 Atrás Centro', type: 'passenger', status: 'free', x: 1.5, y: 3 },
        { id: 's6', label: 'A6 Atrás Der', type: 'passenger', status: 'free', x: 2, y: 3 }
      ];
    } else if (v.type === 'COMBI') {
      layout = [
        { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied', x: 1, y: 1 },
        { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 3, y: 1 },
        { id: 's2', label: 'A2', type: 'passenger', status: 'free', x: 1, y: 2 },
        { id: 's3', label: 'A3', type: 'passenger', status: 'free', x: 2, y: 2 },
        { id: 's4', label: 'A4', type: 'passenger', status: 'occupied', x: 3, y: 2 },
        { id: 's5', label: 'A5', type: 'passenger', status: 'free', x: 1, y: 3 },
        { id: 's6', label: 'A6', type: 'passenger', status: 'occupied', x: 2, y: 3 },
        { id: 's7', label: 'A7', type: 'passenger', status: 'free', x: 3, y: 3 },
        { id: 's8', label: 'A8', type: 'passenger', status: 'free', x: 1, y: 4 },
        { id: 's9', label: 'A9', type: 'passenger', status: 'free', x: 2, y: 4 },
        { id: 's10', label: 'A10', type: 'passenger', status: 'free', x: 3, y: 4 },
        { id: 's11', label: 'A11', type: 'passenger', status: 'free', x: 1, y: 5 },
        { id: 's12', label: 'A12', type: 'passenger', status: 'free', x: 1.6, y: 5 },
        { id: 's13', label: 'A13', type: 'passenger', status: 'free', x: 2.3, y: 5 },
        { id: 's14', label: 'A14', type: 'passenger', status: 'free', x: 3, y: 5 }
      ];
    } else {
      layout = [
        { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
        { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 2, y: 1 },
        { id: 's2', label: 'Atrás Izq A2', type: 'passenger', status: 'occupied', x: 1, y: 2 },
        { id: 's3', label: 'Atrás Centro A3', type: 'passenger', status: 'free', x: 1.5, y: 2 },
        { id: 's4', label: 'Atrás Der A4', type: 'passenger', status: 'free', x: 2, y: 2 }
      ];
    }

    await client.query(`
      INSERT INTO public.vehicles (
        id, owner_id, group_id, plate, brand_model, vehicle_type, seat_layout, capacity,
        roof_rack, max_cargo_kg, cargo_status, status, current_location, current_heading, last_location_update
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, 'VACIO', $11,
        ST_SetSRID(ST_MakePoint($12, $13), 4326), $14, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        owner_id = EXCLUDED.owner_id,
        group_id = EXCLUDED.group_id,
        plate = EXCLUDED.plate,
        brand_model = EXCLUDED.brand_model,
        vehicle_type = EXCLUDED.vehicle_type,
        capacity = EXCLUDED.capacity,
        status = EXCLUDED.status,
        current_location = EXCLUDED.current_location,
        last_location_update = NOW();
    `, [v.id, v.ownerId, v.groupId, v.plate, v.brand, v.type, JSON.stringify(layout), v.capacity, v.roofRack, v.maxCargo, v.status, v.lng, v.lat, v.heading]);
  }
  console.log('✓ 5 Vehículos de la flota registrados y geolocalizados.');

  // 5. Pines de pasajeros en espera ("Esperando aquí")
  await client.query(`
    INSERT INTO public.waiting_passengers (id, user_id, group_id, location, destination_reference, expires_at)
    VALUES 
      (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(-77.7552, -10.7482), 4326), 'Hacia Plaza de Armas Barranca', NOW() + INTERVAL '30 minutes'),
      (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(-77.7610, -10.7510), 4326), 'Hacia Supe Pueblo (Mercado)', NOW() + INTERVAL '25 minutes')
    ON CONFLICT DO NOTHING;
  `);
  console.log('✓ Pasajeros en espera con coordenadas activas.');

  console.log('================================================================');
  console.log(' SIEMBRA EXITOSA: Flota, Grupos y Usuarios listos para pruebas.');
  console.log('================================================================');
  await client.end();
}

seed().catch(err => {
  console.error('Error durante la siembra expandida:', err);
  process.exit(1);
});
