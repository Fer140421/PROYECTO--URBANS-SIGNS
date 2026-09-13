-- =========================================================================
-- MIGRACIÓN FASE 1: CONEXIÓN DE PRÉSTAMOS, ENTREGA FÍSICA Y PLANIFICACIÓN
-- Sistema Urban Signs SRL
-- =========================================================================

-- 1. Vincular préstamos de herramientas a un pedido específico (opcional)
ALTER TABLE prestamos_material_trabajo 
ADD COLUMN IF NOT EXISTS id_pedido BIGINT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_prestamo_pedido'
    ) THEN
        ALTER TABLE prestamos_material_trabajo 
        ADD CONSTRAINT fk_prestamo_pedido 
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Agregar campos para entrega física y App Móvil en pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS fecha_entrega_real TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS foto_evidencia VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS observacion_entrega TEXT NULL,
ADD COLUMN IF NOT EXISTS entregado_por BIGINT NULL,
ADD COLUMN IF NOT EXISTS latitud_entrega DECIMAL(10,8) NULL,
ADD COLUMN IF NOT EXISTS longitud_entrega DECIMAL(11,8) NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pedido_entregador'
    ) THEN
        ALTER TABLE pedidos 
        ADD CONSTRAINT fk_pedido_entregador 
        FOREIGN KEY (entregado_por) REFERENCES employees(id_employee) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Vincular trabajador asignado en trabajos programados
ALTER TABLE trabajo_programado 
ADD COLUMN IF NOT EXISTS id_trabajador_asignado BIGINT NULL,
ADD COLUMN IF NOT EXISTS trabajador VARCHAR(255) NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_trabajo_prog_trabajador'
    ) THEN
        ALTER TABLE trabajo_programado 
        ADD CONSTRAINT fk_trabajo_prog_trabajador 
        FOREIGN KEY (id_trabajador_asignado) REFERENCES employees(id_employee) ON DELETE SET NULL;
    END IF;
END $$;
