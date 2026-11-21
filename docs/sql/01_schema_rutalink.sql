-- ============================================================================
-- PROYECTO INTEGRADOR: RUTALINK (UNAB - CICLO IV)
-- SCRIPT 01: ESQUEMA MAESTRO DE BASE DE DATOS Y SEGURIDAD RLS
-- UBICACIÓN: /docs/sql/01_schema_rutalink.sql
-- AUTOR: Angel Emanuel Matos Conga
-- STACK: PostgreSQL 15+ / PostGIS / Supabase
-- ============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'PASAJERO',
            'CONDUCTOR_AFILIADO',
            'CONDUCTOR_INDEPENDIENTE',
            'ADMIN_EMPRESA',
            'ENCARGADO_PARADERO',
            'SUPERADMIN'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM (
            'ACTIVO',
            'EN_ESPERA',
            'SUSPENDIDO'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_type') THEN
        CREATE TYPE group_type AS ENUM (
            'EMPRESARIAL',
            'COMUNITARIO'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
        CREATE TYPE vehicle_type AS ENUM (
            'SEDAN',
            'SUV',
            'MINIVAN',
            'COMBI'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
        CREATE TYPE vehicle_status AS ENUM (
            'DISPONIBLE',
            'EN_RUTA',
            'LLENO',
            'FUERA_SERVICIO'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stop_type') THEN
        CREATE TYPE stop_type AS ENUM (
            'BASE',
            'ZONA_TRANQUILA',
            'HABITUAL'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status') THEN
        CREATE TYPE trip_status AS ENUM (
            'SOLICITADO',
            'PACTADO',
            'EN_CURSO',
            'FINALIZADO',
            'CANCELADO'
        );
    END IF;
END $$;

-- 3. TABLAS PRINCIPALES DEL SISTEMA

-- 3.1. PERFILES DE USUARIO (Vinculados con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    active_role user_role NOT NULL DEFAULT 'PASAJERO',
    account_status account_status NOT NULL DEFAULT 'ACTIVO',
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    total_trips INT NOT NULL DEFAULT 0,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2. GRUPOS EMPRESARIALES Y COMUNITARIOS
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type group_type NOT NULL DEFAULT 'EMPRESARIAL',
    description TEXT,
    base_address TEXT,
    base_location GEOMETRY(Point, 4326),
    contact_phone TEXT,
    fare_range TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3. MEMBRESÍA Y ASIGNACIÓN DE ROLES DENTRO DEL GRUPO
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_group user_role NOT NULL,
    status account_status NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 3.4. PARADEROS FÍSICOS Y PUNTOS DE PARADA EN ZONAS TRANQUILAS
CREATE TABLE IF NOT EXISTS public.stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type stop_type NOT NULL DEFAULT 'ZONA_TRANQUILA',
    location GEOMETRY(Point, 4326) NOT NULL,
    address_reference TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5. VEHÍCULOS (CON LAYOUT 2D INTERACTIVO JSONB)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    plate TEXT UNIQUE NOT NULL,
    brand_model TEXT NOT NULL,
    vehicle_type vehicle_type NOT NULL DEFAULT 'SEDAN',
    seat_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
    capacity INT NOT NULL DEFAULT 4,
    roof_rack BOOLEAN NOT NULL DEFAULT FALSE,
    max_cargo_kg INT NOT NULL DEFAULT 50,
    cargo_status TEXT NOT NULL DEFAULT 'DISPONIBLE', -- 'VACIO', 'MEDIO', 'LLENO'
    status vehicle_status NOT NULL DEFAULT 'DISPONIBLE',
    current_location GEOMETRY(Point, 4326),
    current_heading NUMERIC(5, 2), -- Dirección en grados (0-360)
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6. CANDADO HORARIO (TBAC) PARA ENCARGADOS DE PARADERO
CREATE TABLE IF NOT EXISTS public.dispatcher_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatcher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=Lunes, 7=Domingo
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7. ESTADO EN VIVO DEL PARADERO (+1/-1 COLA VEHICULAR Y FOTO EN VIVO)
CREATE TABLE IF NOT EXISTS public.stop_live_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE UNIQUE,
    dispatcher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    queued_vehicles_count INT NOT NULL DEFAULT 0 CHECK (queued_vehicles_count >= 0),
    status_note TEXT,
    photo_url TEXT,
    verified_location GEOMETRY(Point, 4326),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8. PASAJEROS EN ESPERA ("ESTOY ESPERANDO AQUÍ" - PIN TEMPORAL 15 MIN)
CREATE TABLE IF NOT EXISTS public.waiting_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    destination_reference TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9. VIAJES Y ACUERDOS AUDITADOS 1 A 1
CREATE TABLE IF NOT EXISTS public.trips_and_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    origin_location GEOMETRY(Point, 4326),
    destination_location GEOMETRY(Point, 4326),
    origin_name TEXT,
    destination_name TEXT,
    agreed_price NUMERIC(6, 2),
    status trip_status NOT NULL DEFAULT 'SOLICITADO',
    tracking_token UUID NOT NULL DEFAULT gen_random_uuid(),
    panic_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    panic_triggered_at TIMESTAMPTZ,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10. CHAT Y MENSAJERÍA MULTINIVEL
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips_and_agreements(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_announcement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11. REGISTRO INMUTABLE DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ÍNDICES ESPACIALES POSTGIS (GIST) Y DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_groups_base_location ON public.groups USING GIST (base_location);
CREATE INDEX IF NOT EXISTS idx_stops_location ON public.stops USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON public.vehicles USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_waiting_passengers_location ON public.waiting_passengers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_trips_origin ON public.trips_and_agreements USING GIST (origin_location);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON public.trips_and_agreements USING GIST (destination_location);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(active_role);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON public.vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_chat_group ON public.chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_trip ON public.chat_messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_waiting_expires ON public.waiting_passengers(expires_at);

-- 5. TRIGGER AUTOMÁTICO PARA CREACIÓN DE PERFIL AL REGISTRARSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, active_role, account_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'active_role')::user_role, 'PASAJERO'::user_role),
        'ACTIVO'::account_status
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatcher_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_live_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips_and_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1. PROFILES POLICIES
DROP POLICY IF EXISTS "Perfiles públicos legibles para todos" ON public.profiles;
CREATE POLICY "Perfiles públicos legibles para todos"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios editan su propio perfil"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6.2. GROUPS POLICIES
DROP POLICY IF EXISTS "Grupos legibles para todos (modo invitado)" ON public.groups;
CREATE POLICY "Grupos legibles para todos (modo invitado)"
    ON public.groups FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin crea grupos" ON public.groups;
CREATE POLICY "Admin crea grupos"
    ON public.groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admin actualiza su grupo" ON public.groups;
CREATE POLICY "Admin actualiza su grupo"
    ON public.groups FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- 6.3. STOPS POLICIES
DROP POLICY IF EXISTS "Paraderos visibles para todos" ON public.stops;
CREATE POLICY "Paraderos visibles para todos"
    ON public.stops FOR SELECT
    USING (true);

-- 6.4. VEHICLES POLICIES
DROP POLICY IF EXISTS "Vehículos en servicio visibles para todos" ON public.vehicles;
CREATE POLICY "Vehículos en servicio visibles para todos"
    ON public.vehicles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Conductores gestionan sus vehículos" ON public.vehicles;
CREATE POLICY "Conductores gestionan sus vehículos"
    ON public.vehicles FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.5. STOP LIVE STATUS POLICIES
DROP POLICY IF EXISTS "Estado de paradero visible para todos" ON public.stop_live_status;
CREATE POLICY "Estado de paradero visible para todos"
    ON public.stop_live_status FOR SELECT
    USING (true);

-- 6.6. WAITING PASSENGERS POLICIES
DROP POLICY IF EXISTS "Pines de espera visibles para conductores y usuarios" ON public.waiting_passengers;
CREATE POLICY "Pines de espera visibles para conductores y usuarios"
    ON public.waiting_passengers FOR SELECT
    TO authenticated
    USING (expires_at > NOW());

DROP POLICY IF EXISTS "Pasajero crea su pin de espera" ON public.waiting_passengers;
CREATE POLICY "Pasajero crea su pin de espera"
    ON public.waiting_passengers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pasajero elimina su pin de espera" ON public.waiting_passengers;
CREATE POLICY "Pasajero elimina su pin de espera"
    ON public.waiting_passengers FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6.7. TRIPS AND AGREEMENTS POLICIES
DROP POLICY IF EXISTS "Participantes ven sus propios viajes" ON public.trips_and_agreements;
CREATE POLICY "Participantes ven sus propios viajes"
    ON public.trips_and_agreements FOR SELECT
    TO authenticated
    USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

DROP POLICY IF EXISTS "Participantes actualizan su viaje" ON public.trips_and_agreements;
CREATE POLICY "Participantes actualizan su viaje"
    ON public.trips_and_agreements FOR UPDATE
    TO authenticated
    USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- 6.8. CHAT MESSAGES POLICIES
DROP POLICY IF EXISTS "Miembros ven mensajes de su grupo o viaje" ON public.chat_messages;
CREATE POLICY "Miembros ven mensajes de su grupo o viaje"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (
        (group_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = chat_messages.group_id AND gm.user_id = auth.uid()
        ))
        OR
        (trip_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.trips_and_agreements ta
            WHERE ta.id = chat_messages.trip_id AND (ta.passenger_id = auth.uid() OR ta.driver_id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "Usuarios envían mensajes a sus grupos o viajes" ON public.chat_messages;
CREATE POLICY "Usuarios envían mensajes a sus grupos o viajes"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);
