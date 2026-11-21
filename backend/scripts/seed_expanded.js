const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
  // 3. Choferes Afiliados a Comités
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'chofer.pativilca@rutalink.pe',
    password: 'RutaLink2026Chofer!',
    fullName: 'Jorge Huamán Castillo',
    phone: '+51 987654323',
    role: 'CONDUCTOR_AFILIADO',
    rating: 4.8
  },
  {
    id: 'a0000000-0000-0000-0000-000000000013',
    email: 'chofer.unab@rutalink.pe',
    password: 'RutaLink2026Chofer!',
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
    email: 'chofer.indep@rutalink.pe',
    password: 'RutaLink2026Indep!',
    fullName: 'Walter Rosales Díaz',
    phone: '+51 987654324',
    role: 'CONDUCTOR_INDEPENDIENTE',
    rating: 4.6
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
    status: 'EN_RUTA',
    lng: -77.7580,
    lat: -10.7500,
    heading: 85.0
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    ownerId: 'a0000000-0000-0000-0000-000000000004',
    groupId: null,
    plate: 'C3M-456',
    brand: 'Chevrolet Sail Sedán',
    type: 'SEDAN',
    capacity: 4,
    roofRack: false,
    maxCargo: 30,
    status: 'DISPONIBLE',
    lng: -77.7520,
    lat: -10.7490,
    heading: 180.0
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    ownerId: 'a0000000-0000-0000-0000-000000000013',
    groupId: 'b0000000-0000-0000-0000-000000000001',
    plate: 'A7U-102',
    brand: 'Toyota Avanza Miniván 2024',
    type: 'MINIVAN',
    capacity: 7,
    roofRack: true,
    maxCargo: 80,
    status: 'DISPONIBLE',
    lng: -77.7615,
    lat: -10.7512,
    heading: 45.0
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    ownerId: 'a0000000-0000-0000-0000-000000000014',
    groupId: 'b0000000-0000-0000-0000-000000000001',
    plate: 'T5F-330',
    brand: 'Hyundai Elantra Sedán',
    type: 'SEDAN',
    capacity: 4,
    roofRack: false,
    maxCargo: 35,
    status: 'DISPONIBLE',
    lng: -77.7125,
    lat: -10.7980,
    heading: 270.0
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    ownerId: 'a0000000-0000-0000-0000-000000000015',
    groupId: 'b0000000-0000-0000-0000-000000000003',
    plate: 'D2K-881',
    brand: 'Nissan Versa Confort',
    type: 'SEDAN',
    capacity: 4,
    roofRack: true,
    maxCargo: 40,
    status: 'EN_RUTA',
    lng: -77.7845,
    lat: -10.6970,
    heading: 350.0
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
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000013', role: 'CONDUCTOR_AFILIADO' },
    { groupId: 'b0000000-0000-0000-0000-000000000001', userId: 'a0000000-0000-0000-0000-000000000014', role: 'CONDUCTOR_AFILIADO' },
    // UNAB Carpooling
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000005', role: 'PASAJERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000016', role: 'PASAJERO' },
    { groupId: 'b0000000-0000-0000-0000-000000000002', userId: 'a0000000-0000-0000-0000-000000000013', role: 'CONDUCTOR_AFILIADO' },
    // Expreso Pativilca
    { groupId: 'b0000000-0000-0000-0000-000000000003', userId: 'a0000000-0000-0000-0000-000000000015', role: 'CONDUCTOR_INDEPENDIENTE' },
    { groupId: 'b0000000-0000-0000-0000-000000000003', userId: 'a0000000-0000-0000-0000-000000000016', role: 'PASAJERO' }
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

  // 4. Flota de Vehículos
  for (const v of VEHICLES) {
    const layout = [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'occupied', x: 1, y: 2 },
      { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free', x: 1.5, y: 2 },
      { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free', x: 2, y: 2 }
    ];

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
