-- ============================================================================
-- PROYECTO INTEGRADOR: RUTALINK (UNAB - CICLO IV)
-- SCRIPT 02: REGLAS DE NEGOCIO SPRINT 2 (TBAC, GEOVALLA, GRUPOS Y STORAGE)
-- UBICACIÓN: /docs/sql/02_sprint2_features.sql
-- AUTOR: Angel Emanuel Matos Conga
-- ============================================================================

-- 1. FUNCIÓN DE VALIDACIÓN EN BASE DE DATOS DE CANDADO HORARIO (TBAC) Y GEOVALLA GPS (100 METROS)
-- Utiliza estrictamente la zona horaria 'America/Lima'
CREATE OR REPLACE FUNCTION public.validate_dispatcher_shift_and_geofence(
    p_dispatcher_id UUID,
    p_stop_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_max_distance_meters DOUBLE PRECISION DEFAULT 100.0
)
RETURNS JSONB AS $$
DECLARE
    v_stop_location GEOMETRY;
    v_shift RECORD;
    v_current_time TIME;
    v_current_dow INT;
    v_distance DOUBLE PRECISION;
    v_dispatcher_point GEOMETRY;
BEGIN
    -- 1. Obtener la hora y día de la semana actual en Perú (America/Lima)
    -- DOW en PostgreSQL: 0=Domingo, 1=Lunes, ..., 6=Sábado. Convertimos a 1=Lunes .. 7=Domingo
    v_current_time := (NOW() AT TIME ZONE 'America/Lima')::TIME;
    v_current_dow := EXTRACT(ISODOW FROM (NOW() AT TIME ZONE 'America/Lima'));

    -- 2. Consultar el turno activo del despachador asignado a este paradero
    SELECT * INTO v_shift
    FROM public.dispatcher_shifts
    WHERE dispatcher_id = p_dispatcher_id
      AND stop_id = p_stop_id
      AND is_active = TRUE
      AND v_current_dow = ANY(days_of_week)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'NO_ACTIVE_SHIFT',
            'message', 'No tiene un turno programado para hoy en este paradero'
        );
    END IF;

    -- 3. Validar Candado Horario (TBAC)
    IF v_current_time < v_shift.start_time OR v_current_time > v_shift.end_time THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'OUTSIDE_SHIFT_HOURS',
            'message', format('Fuera de horario de turno (%s - %s). Hora actual en Barranca: %s', v_shift.start_time, v_shift.end_time, v_current_time),
            'start_time', v_shift.start_time,
            'end_time', v_shift.end_time,
            'current_time', v_current_time
        );
    END IF;

    -- 4. Obtener ubicación del paradero
    SELECT location INTO v_stop_location
    FROM public.stops
    WHERE id = p_stop_id;

    IF v_stop_location IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'STOP_NOT_FOUND',
            'message', 'El paradero especificado no existe o no tiene coordenadas válidas'
        );
    END IF;

    -- 5. Validar Geovalla GPS con PostGIS ST_DistanceSphere (en metros)
    v_dispatcher_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
    v_distance := ST_DistanceSphere(v_dispatcher_point, v_stop_location);

    IF v_distance > p_max_distance_meters THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'OUTSIDE_GEOFENCE',
            'message', format('Ubicación GPS a %.1f metros del paradero. El límite máximo de seguridad es %.0f metros.', v_distance, p_max_distance_meters),
            'distance_meters', round(v_distance::numeric, 1),
            'max_allowed_meters', p_max_distance_meters
        );
    END IF;

    -- 6. Validación completamente aprobada
    RETURN jsonb_build_object(
        'allowed', true,
        'message', 'Validación exitosa de candado horario y geovalla GPS',
        'distance_meters', round(v_distance::numeric, 1),
        'current_time', v_current_time
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROCEDIMIENTO ATÓMICO PARA ACTUALIZAR COLA VEHICULAR (+1 / -1)
CREATE OR REPLACE FUNCTION public.update_stop_queue_with_tbac(
    p_dispatcher_id UUID,
    p_stop_id UUID,
    p_delta INT,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_status_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_val JSONB;
    v_new_count INT;
BEGIN
    -- Validar turno y geovalla
    v_val := public.validate_dispatcher_shift_and_geofence(p_dispatcher_id, p_stop_id, p_lat, p_lng, 100.0);
    
    IF NOT (v_val->>'allowed')::BOOLEAN THEN
        RETURN v_val;
    END IF;

    -- Actualizar el estado en vivo de la cola vehicular
    INSERT INTO public.stop_live_status (
        stop_id, dispatcher_id, queued_vehicles_count, status_note, verified_location, updated_at
    ) VALUES (
        p_stop_id, p_dispatcher_id, GREATEST(0, p_delta), p_status_note,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), NOW()
    )
    ON CONFLICT (stop_id) DO UPDATE SET
        queued_vehicles_count = GREATEST(0, public.stop_live_status.queued_vehicles_count + p_delta),
        status_note = COALESCE(p_status_note, public.stop_live_status.status_note),
        verified_location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326),
        dispatcher_id = p_dispatcher_id,
        updated_at = NOW()
    RETURNING queued_vehicles_count INTO v_new_count;

    -- Registrar evento en audit_logs
    INSERT INTO public.audit_logs (user_id, action, details)
    VALUES (
        p_dispatcher_id,
        'DISPATCHER_QUEUE_UPDATE',
        jsonb_build_object(
            'stop_id', p_stop_id,
            'delta', p_delta,
            'new_count', v_new_count,
            'latitude', p_lat,
            'longitude', p_lng
        )
    );

    RETURN jsonb_build_object(
        'allowed', true,
        'queued_vehicles_count', v_new_count,
        'message', 'Cola vehicular actualizada correctamente'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. STORAGE BUCKET PARA FOTOS EN VIVO DEL PARADERO
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispatcher-photos', 'dispatcher-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para fotos en vivo
DROP POLICY IF EXISTS "Fotos de paradero visibles públicamente" ON storage.objects;
CREATE POLICY "Fotos de paradero visibles públicamente"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'dispatcher-photos');

DROP POLICY IF EXISTS "Despachadores suben fotos con autenticación" ON storage.objects;
CREATE POLICY "Despachadores suben fotos con autenticación"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'dispatcher-photos');
