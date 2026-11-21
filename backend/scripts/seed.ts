import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'ADMIN_EMPRESA' | 'ENCARGADO_PARADERO' | 'CONDUCTOR_AFILIADO' | 'CONDUCTOR_INDEPENDIENTE' | 'PASAJERO';
}

const TEST_USERS: TestUser[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin.barranca@rutalink.pe',
    password: 'RutaLink2026Admin!',
    fullName: 'Carlos Mendoza Ramos',
    phone: '+51 987654321',
    role: 'ADMIN_EMPRESA'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'despachador.supe@rutalink.pe',
    password: 'RutaLink2026Desp!',
    fullName: 'Manuel Silva Bazalar',
    phone: '+51 987654322',
    role: 'ENCARGADO_PARADERO'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'chofer.pativilca@rutalink.pe',
    password: 'RutaLink2026Chofer!',
    fullName: 'Jorge Huamán Castillo',
    phone: '+51 987654323',
    role: 'CONDUCTOR_AFILIADO'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'chofer.indep@rutalink.pe',
    password: 'RutaLink2026Indep!',
    fullName: 'Walter Rosales Díaz',
    phone: '+51 987654324',
    role: 'CONDUCTOR_INDEPENDIENTE'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'estudiante.unab@rutalink.pe',
    password: 'RutaLink2026Estudiante!',
    fullName: 'Lucía Fernández Vega',
    phone: '+51 987654325',
    role: 'PASAJERO'
  }
];

async function seedDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL no definido.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- Creando 5 Cuentas Verificadas y Datos de Prueba de Barranca ---');

    for (const u of TEST_USERS) {
      console.log(`Registrando/Actualizando usuario: ${u.email} (${u.role})...`);

      // 1. Insertar en auth.users si no existe
      await client.query(`
        INSERT INTO auth.users (
          id, instance_id, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at,
          confirmation_token, recovery_token, email_change_token_new, email_change,
          email_change_token_current, phone_change, phone_change_token, reauthentication_token,
          is_sso_user, is_anonymous
        ) VALUES (
          $1,
          '00000000-0000-0000-0000-000000000000',
          $2,
          crypt($3, gen_salt('bf')),
          NOW(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $4::text, 'phone', $5::text, 'active_role', $6::text),
          'authenticated',
          'authenticated',
          NOW(),
          NOW(),
          '', '', '', '', '', '', '', '',
          false, false
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          encrypted_password = crypt($3, gen_salt('bf')),
          raw_user_meta_data = EXCLUDED.raw_user_meta_data,
          confirmation_token = COALESCE(auth.users.confirmation_token, ''),
          recovery_token = COALESCE(auth.users.recovery_token, ''),
          updated_at = NOW();
      `, [u.id, u.email, u.password, u.fullName, u.phone, u.role]);

      // 2. Asegurar el perfil en public.profiles
      await client.query(`
        INSERT INTO public.profiles (
          id, full_name, email, phone, active_role, account_status, rating
        ) VALUES (
          $1, $2, $3, $4, $5, 'ACTIVO', 5.00
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          active_role = EXCLUDED.active_role,
          updated_at = NOW();
      `, [u.id, u.fullName, u.email, u.phone, u.role]);
    }

    console.log('✓ 5 Cuentas creadas y verificadas en auth.users y public.profiles.');

    // 3. Crear Grupo Empresarial "Línea 1 Barranca - Supe - Pativilca"
    const groupId = 'b0000000-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO public.groups (
        id, name, type, description, base_address, base_location, contact_phone, fare_range, created_by
      ) VALUES (
        $1,
        'Comité 1 de Transporte Barranca - Supe - UNAB',
        'EMPRESARIAL',
        'Asociación formal de transporte interdistrital con paraderos autorizados y flota sedán/miniván.',
        'Av. José Gálvez 450, Barranca',
        ST_SetSRID(ST_MakePoint(-77.7615, -10.7512), 4326),
        '+51 987654321',
        'S/. 2.50 - S/. 4.00',
        'a0000000-0000-0000-0000-000000000001'
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        fare_range = EXCLUDED.fare_range;
    `, [groupId]);

    // 4. Afiliar miembros al grupo
    await client.query(`
      INSERT INTO public.group_members (group_id, user_id, role_in_group, status)
      VALUES 
        ($1, 'a0000000-0000-0000-0000-000000000001', 'ADMIN_EMPRESA', 'ACTIVO'),
        ($1, 'a0000000-0000-0000-0000-000000000002', 'ENCARGADO_PARADERO', 'ACTIVO'),
        ($1, 'a0000000-0000-0000-0000-000000000003', 'CONDUCTOR_AFILIADO', 'ACTIVO')
      ON CONFLICT (group_id, user_id) DO UPDATE SET
        role_in_group = EXCLUDED.role_in_group,
        status = EXCLUDED.status;
    `, [groupId]);

    // 5. Crear Paraderos Físicos y Zonas Tranquilas
    const stops = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Paradero Base Central Barranca',
        type: 'BASE',
        lat: -10.7512,
        lng: -77.7615,
        ref: 'Av. José Gálvez 450 (Cerca a Plaza Vea)'
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        name: 'Punto de Parada UNAB - Campus Universitario',
        type: 'ZONA_TRANQUILA',
        lat: -10.7485,
        lng: -77.7550,
        ref: 'Puerta Principal Av. Toribio de Luzuriaga'
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        name: 'Paradero Supe Pueblo',
        type: 'BASE',
        lat: -10.7980,
        lng: -77.7125,
        ref: 'Calle Francisco Bolognesi (Plaza de Supe)'
      },
      {
        id: 'c0000000-0000-0000-0000-000000000004',
        name: 'Punto Tranquilo Óvalo Pativilca',
        type: 'ZONA_TRANQUILA',
        lat: -10.6970,
        lng: -77.7845,
        ref: 'Cruce Panamericana Norte y desvío Huaraz'
      },
      {
        id: 'c0000000-0000-0000-0000-000000000005',
        name: 'Punto de Abordaje Paramonga',
        type: 'ZONA_TRANQUILA',
        lat: -10.6720,
        lng: -77.8150,
        ref: 'Entrada Av. Ferrocarril'
      }
    ];

    for (const s of stops) {
      await client.query(`
        INSERT INTO public.stops (id, group_id, name, type, location, address_reference)
        VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          location = EXCLUDED.location,
          address_reference = EXCLUDED.address_reference;
      `, [s.id, groupId, s.name, s.type, s.lng, s.lat, s.ref]);
    }

    // 6. Turno del Encargado de Paradero (06:00 a 21:00)
    await client.query(`
      INSERT INTO public.dispatcher_shifts (
        dispatcher_id, stop_id, start_time, end_time, days_of_week, is_active
      ) VALUES (
        'a0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000001',
        '06:00:00',
        '21:00:00',
        '{1,2,3,4,5,6,7}',
        true
      )
      ON CONFLICT DO NOTHING;
    `);

    // 7. Estado inicial en vivo del paradero central
    await client.query(`
      INSERT INTO public.stop_live_status (
        stop_id, dispatcher_id, queued_vehicles_count, status_note, verified_location, updated_at
      ) VALUES (
        'c0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002',
        3,
        'Flujo normal. Salidas cada 5 minutos hacia UNAB y Supe.',
        ST_SetSRID(ST_MakePoint(-77.7615, -10.7512), 4326),
        NOW()
      )
      ON CONFLICT (stop_id) DO UPDATE SET
        queued_vehicles_count = EXCLUDED.queued_vehicles_count,
        status_note = EXCLUDED.status_note,
        updated_at = NOW();
    `);

    // 8. Vehículo de prueba del Conductor Afiliado (Toyota Probox / Yaris Sedán)
    const vehicleId = 'd0000000-0000-0000-0000-000000000001';
    const seatLayout = [
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
        $1,
        'a0000000-0000-0000-0000-000000000003',
        $2,
        'B1A-789',
        'Toyota Yaris Sedán 2022',
        'SEDAN',
        $3::jsonb,
        4,
        true,
        40,
        'VACIO',
        'DISPONIBLE',
        ST_SetSRID(ST_MakePoint(-77.7580, -10.7500), 4326),
        85.5,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        seat_layout = EXCLUDED.seat_layout,
        last_location_update = NOW();
    `, [vehicleId, groupId, JSON.stringify(seatLayout)]);

    // Vehículo del conductor independiente
    const vehicleId2 = 'd0000000-0000-0000-0000-000000000002';
    await client.query(`
      INSERT INTO public.vehicles (
        id, owner_id, group_id, plate, brand_model, vehicle_type, seat_layout, capacity,
        roof_rack, max_cargo_kg, cargo_status, status, current_location, current_heading, last_location_update
      ) VALUES (
        $1,
        'a0000000-0000-0000-0000-000000000004',
        NULL,
        'C3M-456',
        'Chevrolet Sail Sedán',
        'SEDAN',
        $2::jsonb,
        4,
        false,
        30,
        'DISPONIBLE',
        'DISPONIBLE',
        ST_SetSRID(ST_MakePoint(-77.7520, -10.7490), 4326),
        180.0,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        last_location_update = NOW();
    `, [vehicleId2, JSON.stringify(seatLayout)]);

    console.log('✓ Grupos, Miembros, Paraderos, Turnos y Vehículos sembrados exitosamente.');
    console.log('--- SEED COMPLETADO SATISFACTORIAMENTE ---');
  } catch (err) {
    console.error('ERROR en el seed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
