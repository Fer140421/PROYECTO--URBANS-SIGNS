-- =========================================================================
-- MIGRACIÓN: UNIDAD DE MEDIDA POR TRABAJO (METROS / CENTÍMETROS)
-- Sistema Urban Signs SRL
-- Permite que cada trabajo individual de una solicitud y cotización pueda
-- medirse en metros ('m') o centímetros ('cm').
-- =========================================================================

-- 1. Añadir columna 'unidad_medida' a solicitud_trabajo con valor por defecto 'm'
ALTER TABLE public.solicitud_trabajo 
ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(10) NOT NULL DEFAULT 'm';

-- 2. Añadir columna 'unidad_medida' a cotizacion_trabajo con valor por defecto 'm'
ALTER TABLE public.cotizacion_trabajo 
ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(10) NOT NULL DEFAULT 'm';

-- 3. Ampliar la precisión de area_total si se requiere para soportar 4 decimales
ALTER TABLE public.solicitud_trabajo 
ALTER COLUMN area_total TYPE NUMERIC(12, 4);

ALTER TABLE public.cotizacion_trabajo 
ALTER COLUMN area_total TYPE NUMERIC(12, 4);

COMMENT ON COLUMN public.solicitud_trabajo.unidad_medida IS 'Unidad de medida de base y altura: m (metros) o cm (centímetros)';
COMMENT ON COLUMN public.cotizacion_trabajo.unidad_medida IS 'Unidad de medida de base y altura: m (metros) o cm (centímetros)';
