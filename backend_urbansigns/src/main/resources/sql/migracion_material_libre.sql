-- =========================================================================
-- MIGRACIÓN: SOPORTE DE MATERIAL / ESPECIFICACIÓN LIBRE (OPCIONAL)
-- Sistema Urban Signs SRL
-- Permite cotizaciones y solicitudes con material libre sin dependencia
-- obligatoria del módulo de inventario de materiales.
-- =========================================================================

-- 1. Añadir columna 'material' a solicitud_trabajo
ALTER TABLE public.solicitud_trabajo 
ADD COLUMN IF NOT EXISTS material VARCHAR(255) NULL;

-- 2. Añadir columna 'material' a cotizacion_trabajo
ALTER TABLE public.cotizacion_trabajo 
ADD COLUMN IF NOT EXISTS material VARCHAR(255) NULL;
