-- ============================================================================
-- PROYECTO INTEGRADOR: RUTALINK (UNAB - CICLO IV)
-- SCRIPT 03: RUTAS OSRM / GEOJSON, SPATIAL BOUNDING BOX Y SALAS EFÍMERAS
-- UBICACIÓN: /docs/sql/03_sprint3_realtime_routes.sql
-- AUTOR: Angel Emanuel Matos Conga
-- ============================================================================

-- 1. TABLA DE RUTAS VIALES FORMALES E INTERDISTRITALES
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    origin_name TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    waypoints GEOMETRY(LineString, 4326),
    distance_km NUMERIC(5, 2) DEFAULT 0.0,
    estimated_duration_min INT DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routes_waypoints ON public.routes USING GIST (waypoints);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rutas visibles públicamente" ON public.routes;
CREATE POLICY "Rutas visibles públicamente"
    ON public.routes FOR SELECT
    USING (true);

-- 2. FUNCIÓN DE FILTRADO ESPACIAL POR BOUNDING BOX (OPTIMIZACIÓN DE RED)
CREATE OR REPLACE FUNCTION public.get_vehicles_in_bbox(
    p_min_lng DOUBLE PRECISION,
    p_min_lat DOUBLE PRECISION,
    p_max_lng DOUBLE PRECISION,
    p_max_lat DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    plate TEXT,
    brand_model TEXT,
    vehicle_type vehicle_type,
    seat_layout JSONB,
    capacity INT,
    roof_rack BOOLEAN,
    max_cargo_kg INT,
    cargo_status TEXT,
    status vehicle_status,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    current_heading DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    driver_name TEXT,
    driver_rating DOUBLE PRECISION,
    group_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.plate,
        v.brand_model,
        v.vehicle_type,
        v.seat_layout,
        v.capacity,
        v.roof_rack,
        v.max_cargo_kg,
        v.cargo_status,
        v.status,
        ST_Y(v.current_location)::double precision AS latitude,
        ST_X(v.current_location)::double precision AS longitude,
        v.current_heading::double precision AS current_heading,
        v.last_location_update,
        p.full_name AS driver_name,
        COALESCE(p.rating, 5.00)::double precision AS driver_rating,
        g.name AS group_name
    FROM public.vehicles v
    JOIN public.profiles p ON v.owner_id = p.id
    LEFT JOIN public.groups g ON v.group_id = g.id
    WHERE v.status != 'FUERA_SERVICIO'
      AND v.current_location && ST_MakeEnvelope(p_min_lng, p_min_lat, p_max_lng, p_max_lat, 4326)
    ORDER BY v.last_location_update DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. SEMBRADO DE RUTAS OFICIALES EN LA PROVINCIA DE BARRANCA
INSERT INTO public.routes (id, group_id, name, origin_name, destination_name, distance_km, estimated_duration_min, waypoints)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Ruta Troncal 1: Barranca Centro — Campus UNAB',
    'Paradero Base Central Barranca',
    'Punto UNAB (Av. Toribio de Luzuriaga)',
    3.8,
    10,
    ST_SetSRID(ST_GeomFromText('LINESTRING(-77.7615 -10.7512, -77.7590 -10.7505, -77.7565 -10.7495, -77.7550 -10.7485)'), 4326)
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Ruta Interdistrital 2: Barranca — Supe Pueblo',
    'Paradero Base Central Barranca',
    'Paradero Supe Pueblo (Plaza Francisco Bolognesi)',
    9.2,
    18,
    ST_SetSRID(ST_GeomFromText('LINESTRING(-77.7615 -10.7512, -77.7530 -10.7650, -77.7380 -10.7820, -77.7125 -10.7980)'), 4326)
),
(
    'e0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Ruta Norte 3: Barranca — Pativilca — Paramonga',
    'Paradero Base Central Barranca',
    'Entrada Paramonga (Fortaleza)',
    14.5,
    25,
    ST_SetSRID(ST_GeomFromText('LINESTRING(-77.7615 -10.7512, -77.7700 -10.7200, -77.7845 -10.6970, -77.8150 -10.6720)'), 4326)
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    waypoints = EXCLUDED.waypoints,
    distance_km = EXCLUDED.distance_km;
