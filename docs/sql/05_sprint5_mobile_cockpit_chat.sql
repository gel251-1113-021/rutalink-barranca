-- ============================================================================
-- PROYECTO INTEGRADOR: RUTALINK (UNAB - CICLO IV)
-- SCRIPT 05: SPRINT 5 - EXPERIENCIA MÓVIL, CHAT GRUPAL, CABINA Y DROPOFFS
-- UBICACIÓN: /docs/sql/05_sprint5_mobile_cockpit_chat.sql
-- ============================================================================

-- 1. PUNTOS DE BAJADA EXACTOS ("ME BAJO AQUÍ") SOLICITADOS POR PASAJEROS
CREATE TABLE IF NOT EXISTS public.passenger_dropoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    passenger_name TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    vehicle_plate TEXT,
    dropoff_location GEOMETRY(Point, 4326) NOT NULL,
    landmark_reference TEXT,
    status TEXT NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'ATENDIDO', 'CANCELADO'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dropoffs_location ON public.passenger_dropoffs USING GIST (dropoff_location);
CREATE INDEX IF NOT EXISTS idx_dropoffs_status ON public.passenger_dropoffs (status);

-- 2. MENSAJERÍA GRUPAL ESTILO WHATSAPP PARA COMITÉS Y ESTUDIANTES
CREATE TABLE IF NOT EXISTS public.group_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'TEXTO', -- 'TEXTO', 'AVISO_RUTA', 'UBICACION', 'AUDIO_SIMULADO'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_chat_group ON public.group_chat_messages (group_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_created ON public.group_chat_messages (created_at ASC);

-- 3. RUTAS PERSONALIZADAS CONSTRUIDAS VISUALMENTE (CREADOR DE RUTAS)
CREATE TABLE IF NOT EXISTS public.custom_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
    path_geom GEOMETRY(LineString, 4326),
    total_km NUMERIC(6, 2) DEFAULT 0.0,
    estimated_minutes INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_routes_geom ON public.custom_routes USING GIST (path_geom);

-- 4. POLÍTICAS RLS (Seguridad Permisiva para Demostración y Pruebas)
ALTER TABLE public.passenger_dropoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de dropoffs" ON public.passenger_dropoffs;
CREATE POLICY "Lectura pública de dropoffs" ON public.passenger_dropoffs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública de dropoffs" ON public.passenger_dropoffs;
CREATE POLICY "Inserción pública de dropoffs" ON public.passenger_dropoffs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización pública de dropoffs" ON public.passenger_dropoffs;
CREATE POLICY "Actualización pública de dropoffs" ON public.passenger_dropoffs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Lectura pública de chat" ON public.group_chat_messages;
CREATE POLICY "Lectura pública de chat" ON public.group_chat_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública de chat" ON public.group_chat_messages;
CREATE POLICY "Inserción pública de chat" ON public.group_chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura pública de custom_routes" ON public.custom_routes;
CREATE POLICY "Lectura pública de custom_routes" ON public.custom_routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de custom_routes" ON public.custom_routes;
CREATE POLICY "Inserción de custom_routes" ON public.custom_routes FOR INSERT WITH CHECK (true);

-- 5. MENSAJES INICIALES DE PRUEBA (ESTILO WHATSAPP DE BARRANCA)
INSERT INTO public.group_chat_messages (group_id, sender_id, sender_name, sender_role, message, message_type, created_at)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Manuel Silva (Despachador)',
    'ENCARGADO_PARADERO',
    'Buenos días a todos los choferes del Comité 1. Paradero Supe con afluencia regular. Salidas programadas cada 4 minutos hacia Barranca y UNAB.',
    'AVISO_RUTA',
    NOW() - INTERVAL '35 minutes'
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    'Jorge Huamán (Toyota B1A-789)',
    'CONDUCTOR_AFILIADO',
    'Conforme Manuel. Acabo de salir de Base Central con 2 pasajeros a bordo. Me quedan 2 asientos libres para quien esté por la Av. Gálvez.',
    'TEXTO',
    NOW() - INTERVAL '20 minutes'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'Lucía Fernández (UNAB Derecho)',
    'PASAJERO',
    'Hola chicos, somos 3 compañeros saliendo de clases en el Campus Luzuriaga hacia Plaza Vea Barranca. ¿Alguien pasando por la puerta principal?',
    'TEXTO',
    NOW() - INTERVAL '12 minutes'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000013',
    'Carlos Morales (Miniván A7U-102)',
    'CONDUCTOR_AFILIADO',
    'Hola Lucía, voy subiendo por Primavera. En 3 minutos estoy en la puerta de la UNAB. Tengo 4 asientos disponibles con tarifa estudiantil S/. 1.50.',
    'TEXTO',
    NOW() - INTERVAL '5 minutes'
  )
ON CONFLICT DO NOTHING;
