-- =========================================================================
-- MIGRACIÓN: IMAGEN DE REFERENCIA POR TRABAJO EN SOLICITUD DE COTIZACIÓN
-- Sistema Urban Signs SRL
-- Permite que cada trabajo individual de una solicitud de cotización pueda
-- tener su propia imagen o diseño de referencia opcional.
-- =========================================================================

-- 1. Añadir columna 'archivo_referencia' a solicitud_trabajo
ALTER TABLE public.solicitud_trabajo 
ADD COLUMN IF NOT EXISTS archivo_referencia VARCHAR(500) NULL;

COMMENT ON COLUMN public.solicitud_trabajo.archivo_referencia IS 'URL o ruta de la foto/diseño de referencia específico para este trabajo';
