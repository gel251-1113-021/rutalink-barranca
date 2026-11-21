-- ============================================================================
-- PROYECTO INTEGRADOR: RUTALINK (UNAB - CICLO IV)
-- SCRIPT 04: MODO OFF-GRID, GATEWAY SMS Y TELEMETRÍA ANALÍTICA
-- UBICACIÓN: /docs/sql/04_sprint4_offgrid_analytics.sql
-- AUTOR: Angel Emanuel Matos Conga
-- ============================================================================

-- 1. TABLA DE REGISTROS DE SMS GATEWAY (FALLBACK 2G SIN DATOS MÓVILES)
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_phone TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    command_raw TEXT NOT NULL,
    response_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROCESADO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SMS logs visibles para administradores y emisor" ON public.sms_logs;
CREATE POLICY "SMS logs visibles para administradores y emisor"
    ON public.sms_logs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserción de logs SMS" ON public.sms_logs;
CREATE POLICY "Permitir inserción de logs SMS"
    ON public.sms_logs FOR INSERT
    WITH CHECK (true);

-- 2. TABLA DE TELEMETRÍA Y EVENTOS DE RESILIENCIA DE RED
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'OFFLINE_DETECTED', 'ONLINE_RESTORED', 'LOCAL_CACHE_SYNC', 'SMS_FALLBACK_TRIGGERED'
    network_type TEXT DEFAULT 'OFFLINE',
    latency_ms INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Telemetría accesible para lectura pública / métricas" ON public.telemetry_logs;
CREATE POLICY "Telemetría accesible para lectura pública / métricas"
    ON public.telemetry_logs FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir inserción de telemetría" ON public.telemetry_logs;
CREATE POLICY "Permitir inserción de telemetría"
    ON public.telemetry_logs FOR INSERT
    WITH CHECK (true);

-- 3. FUNCIÓN ANALÍTICA DE RENDIMIENTO DE TRANSPORTE
CREATE OR REPLACE FUNCTION public.get_daily_transport_metrics()
RETURNS JSONB AS $$
DECLARE
    v_total_vehicles INT;
    v_active_vehicles INT;
    v_total_stops INT;
    v_total_queued INT;
    v_total_routes INT;
    v_avg_rating NUMERIC(3, 2);
    v_total_agreements INT;
    v_sms_queries INT;
    v_result JSONB;
BEGIN
    SELECT COUNT(*) INTO v_total_vehicles FROM public.vehicles;
    SELECT COUNT(*) INTO v_active_vehicles FROM public.vehicles WHERE status = 'DISPONIBLE';
    SELECT COUNT(*) INTO v_total_stops FROM public.stops;
    SELECT COALESCE(SUM(queued_vehicles_count), 0) INTO v_total_queued FROM public.stop_live_status;
    SELECT COUNT(*) INTO v_total_routes FROM public.routes WHERE is_active = TRUE;
    SELECT COALESCE(ROUND(AVG(rating), 2), 5.00) INTO v_avg_rating FROM public.profiles WHERE active_role IN ('CONDUCTOR_AFILIADO', 'CONDUCTOR_INDEPENDIENTE');
    SELECT COUNT(*) INTO v_total_agreements FROM public.trips_and_agreements;
    SELECT COUNT(*) INTO v_sms_queries FROM public.sms_logs;

    v_result := jsonb_build_object(
        'total_vehicles', v_total_vehicles,
        'active_vehicles', v_active_vehicles,
        'total_stops', v_total_stops,
        'total_queued', v_total_queued,
        'total_routes', v_total_routes,
        'avg_rating', v_avg_rating,
        'total_agreements', v_total_agreements,
        'sms_queries', v_sms_queries,
        'generated_at', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;
