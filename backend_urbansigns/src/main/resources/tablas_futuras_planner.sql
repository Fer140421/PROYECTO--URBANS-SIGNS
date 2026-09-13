-- ============================================
-- SISTEMA DE PLANIFICACIÓN SEMANAL DE TRABAJOS
-- ============================================

-- ============================================
-- 1. TABLA: planificacion_semanal
-- ============================================
-- Representa una semana de planificación
CREATE TABLE planificacion_semanal (
    id_planificacion SERIAL PRIMARY KEY,
    
    -- Identificación de la semana
    semana_numero INT NOT NULL,                    -- Semana del mes (1, 2, 3, 4)
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12), -- Mes (1-12)
    anio INT NOT NULL,                             -- Año
    
    -- Rango de fechas de la semana
    fecha_inicio DATE NOT NULL,                    -- Lunes de la semana
    fecha_fin DATE NOT NULL,                       -- Domingo/Sábado de la semana
    
    -- Metadata
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INT,                                -- Usuario que creó la planificación
    estado VARCHAR(20) DEFAULT 'ACTIVA' 
        CHECK (estado IN ('BORRADOR', 'ACTIVA', 'CERRADA', 'ARCHIVADA')),
    
    observaciones TEXT,
    requerimiento_materiales TEXT,                 -- Materiales a pedir para la semana
    
    -- Constraint: Solo una planificación activa por semana
    CONSTRAINT unique_semana_activa 
        UNIQUE (semana_numero, mes, anio),
    
    CONSTRAINT fk_creador 
        FOREIGN KEY (creado_por) REFERENCES users(id_user)
);

COMMENT ON TABLE planificacion_semanal IS 'Planificación semanal de trabajos (similar al Excel)';
COMMENT ON COLUMN planificacion_semanal.semana_numero IS 'Número de semana del mes (1-4)';
COMMENT ON COLUMN planificacion_semanal.estado IS 'BORRADOR: En edición, ACTIVA: Semana actual, CERRADA: Semana completada';


-- ============================================
-- 2. TABLA: trabajo_programado
-- ============================================
-- Representa un trabajo específico programado en la semana
CREATE TABLE trabajo_programado (
    id_trabajo_programado SERIAL PRIMARY KEY,
    
    -- Relación con la planificación semanal
    id_planificacion INT NOT NULL,
    
    -- Relación con el pedido/orden
    id_pedido INT,                                 -- Pedido relacionado (si existe)
    id_orden_impresion INT,                        -- Orden de impresión (si existe)
    
    -- Información del trabajo
    nro_fila INT,                                  -- Número de fila en el Excel (orden visual)
    descripcion_trabajo TEXT NOT NULL,             -- Descripción breve del trabajo
    
    -- Área de trabajo (tipo de trabajo)
    area_trabajo VARCHAR(50) NOT NULL 
        CHECK (area_trabajo IN ('ENSAMBLAJE', 'ESTRUCTURAS', 'ESTRUCTURA-ENSAMBLAJE', 'TALLER', 'EXTERNO')),
    
    -- Ubicación y contacto
    direccion_colocacion TEXT,
    contacto_cliente VARCHAR(100),
    
    -- Asignaciones
    id_trabajador_asignado BIGINT,                 -- Empleado asignado (relacionado con employees)
    trabajador VARCHAR(255),                       -- Nombre o descripcion del trabajador asignado
    id_cotizador INT,                              -- Usuario que cotizó (para referencia)
    
    -- Programación de fecha y hora
    fecha_programada DATE NOT NULL,                -- Día específico de entrega
    hora_programada TIME,                          -- Hora específica (ej: 15:00)
    
    -- Estado de cumplimiento
    estado_cumplimiento VARCHAR(20) DEFAULT 'PENDIENTE'
        CHECK (estado_cumplimiento IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'NO_CUMPLIDO', 'REPROGRAMADO')),
    
    fecha_real_entrega TIMESTAMP,                  -- Fecha/hora real de entrega
    
    -- Observaciones y seguimiento
    observaciones TEXT,
    motivo_incumplimiento TEXT,                    -- Si no se cumplió, por qué
    
    -- Metadata
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_planificacion 
        FOREIGN KEY (id_planificacion) REFERENCES planificacion_semanal(id_planificacion)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_trabajo_pedido 
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_trabajo_orden 
        FOREIGN KEY (id_orden_impresion) REFERENCES orden_impresion(id_orden)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_trabajador 
        FOREIGN KEY (id_trabajador_asignado) REFERENCES employees(id_employee)
        ON DELETE SET NULL,
    
    CONSTRAINT fk_cotizador 
        FOREIGN KEY (id_cotizador) REFERENCES users(id_user)
);

COMMENT ON TABLE trabajo_programado IS 'Trabajo individual programado en una semana específica';
COMMENT ON COLUMN trabajo_programado.area_trabajo IS 'Área donde se realiza el trabajo: ENSAMBLAJE, ESTRUCTURAS, etc.';
COMMENT ON COLUMN trabajo_programado.estado_cumplimiento IS 'Estado de cumplimiento: PENDIENTE, COMPLETADO, NO_CUMPLIDO, REPROGRAMADO';


-- ============================================
-- 3. TABLA: historial_reprogramacion
-- ============================================
-- Registro de cambios de fecha de trabajos programados
CREATE TABLE historial_reprogramacion (
    id_reprogramacion SERIAL PRIMARY KEY,
    id_trabajo_programado INT NOT NULL,
    
    fecha_original DATE NOT NULL,
    hora_original TIME,
    fecha_nueva DATE NOT NULL,
    hora_nueva TIME,
    
    motivo TEXT NOT NULL,
    usuario_reprogramo INT NOT NULL,
    fecha_reprogramacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_trabajo_reprog 
        FOREIGN KEY (id_trabajo_programado) REFERENCES trabajo_programado(id_trabajo_programado)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_usuario_reprog 
        FOREIGN KEY (usuario_reprogramo) REFERENCES users(id_user)
);

COMMENT ON TABLE historial_reprogramacion IS 'Historial de reprogramaciones de trabajos';


-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Búsquedas por semana
CREATE INDEX idx_planificacion_semana ON planificacion_semanal(anio, mes, semana_numero);
CREATE INDEX idx_planificacion_estado ON planificacion_semanal(estado);
CREATE INDEX idx_planificacion_fechas ON planificacion_semanal(fecha_inicio, fecha_fin);

-- Búsquedas de trabajos
CREATE INDEX idx_trabajo_prog_planificacion ON trabajo_programado(id_planificacion);
CREATE INDEX idx_trabajo_prog_fecha ON trabajo_programado(fecha_programada);
CREATE INDEX idx_trabajo_prog_trabajador ON trabajo_programado(id_trabajador_asignado);
CREATE INDEX idx_trabajo_prog_estado ON trabajo_programado(estado_cumplimiento);
CREATE INDEX idx_trabajo_prog_pedido ON trabajo_programado(id_pedido);


-- ============================================
-- FUNCIÓN: Obtener número de semana del mes
-- ============================================
CREATE OR REPLACE FUNCTION obtener_semana_del_mes(fecha DATE)
RETURNS INT AS $$
DECLARE
    primer_dia_mes DATE;
    dia_semana_primer_dia INT;
    dia_del_mes INT;
    semana INT;
BEGIN
    -- Obtener el primer día del mes
    primer_dia_mes := DATE_TRUNC('month', fecha)::DATE;
    
    -- Obtener el día de la semana del primer día (0=Domingo, 1=Lunes, ..., 6=Sábado)
    dia_semana_primer_dia := EXTRACT(DOW FROM primer_dia_mes);
    
    -- Obtener el día del mes de la fecha dada
    dia_del_mes := EXTRACT(DAY FROM fecha);
    
    -- Calcular la semana
    -- Si el mes empieza en domingo (0), la primera semana empieza el día 1
    -- Si empieza en lunes (1), la primera semana también empieza el día 1
    -- Ajustar para que el lunes sea el inicio de la semana
    IF dia_semana_primer_dia = 0 THEN
        dia_semana_primer_dia := 7; -- Domingo como último día
    END IF;
    
    semana := CEIL((dia_del_mes + dia_semana_primer_dia - 1) / 7.0);
    
    RETURN semana;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION obtener_semana_del_mes IS 'Calcula el número de semana dentro del mes (1-5)';


-- ============================================
-- FUNCIÓN: Crear planificación semanal automática
-- ============================================
CREATE OR REPLACE FUNCTION crear_planificacion_semanal(
    p_fecha_inicio DATE,
    p_creado_por INT
)
RETURNS INT AS $$
DECLARE
    v_id_planificacion INT;
    v_semana_numero INT;
    v_mes INT;
    v_anio INT;
    v_fecha_fin DATE;
BEGIN
    -- Calcular semana, mes y año
    v_semana_numero := obtener_semana_del_mes(p_fecha_inicio);
    v_mes := EXTRACT(MONTH FROM p_fecha_inicio);
    v_anio := EXTRACT(YEAR FROM p_fecha_inicio);
    
    -- Calcular fecha fin (6 días después, o sea, sábado)
    v_fecha_fin := p_fecha_inicio + INTERVAL '5 days';
    
    -- Insertar la planificación
    INSERT INTO planificacion_semanal (
        semana_numero, mes, anio, 
        fecha_inicio, fecha_fin, 
        creado_por, estado
    )
    VALUES (
        v_semana_numero, v_mes, v_anio,
        p_fecha_inicio, v_fecha_fin,
        p_creado_por, 'BORRADOR'
    )
    RETURNING id_planificacion INTO v_id_planificacion;
    
    RETURN v_id_planificacion;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION crear_planificacion_semanal IS 'Crea una nueva planificación semanal para un rango de fechas';


-- ============================================
-- VISTA: Resumen de planificación semanal
-- ============================================
CREATE OR REPLACE VIEW vista_resumen_planificacion AS
SELECT 
    ps.id_planificacion,
    ps.semana_numero,
    ps.mes,
    ps.anio,
    ps.fecha_inicio,
    ps.fecha_fin,
    ps.estado,
    
    -- Contadores de trabajos
    COUNT(tp.id_trabajo_programado) AS total_trabajos,
    COUNT(CASE WHEN tp.estado_cumplimiento = 'COMPLETADO' THEN 1 END) AS trabajos_completados,
    COUNT(CASE WHEN tp.estado_cumplimiento = 'PENDIENTE' THEN 1 END) AS trabajos_pendientes,
    COUNT(CASE WHEN tp.estado_cumplimiento = 'NO_CUMPLIDO' THEN 1 END) AS trabajos_no_cumplidos,
    
    -- Porcentaje de cumplimiento
    CASE 
        WHEN COUNT(tp.id_trabajo_programado) > 0 THEN
            ROUND((COUNT(CASE WHEN tp.estado_cumplimiento = 'COMPLETADO' THEN 1 END)::NUMERIC / 
                   COUNT(tp.id_trabajo_programado)::NUMERIC) * 100, 2)
        ELSE 0
    END AS porcentaje_cumplimiento,
    
    -- Trabajadores involucrados
    COUNT(DISTINCT tp.id_trabajador_asignado) AS total_trabajadores_asignados
    
FROM planificacion_semanal ps
LEFT JOIN trabajo_programado tp ON ps.id_planificacion = tp.id_planificacion
GROUP BY ps.id_planificacion
ORDER BY ps.anio DESC, ps.mes DESC, ps.semana_numero DESC;

COMMENT ON VIEW vista_resumen_planificacion IS 'Resumen estadístico de cada planificación semanal';


-- ============================================
-- VISTA: Trabajos programados con detalles
-- ============================================
CREATE OR REPLACE VIEW vista_trabajos_programados_detalle AS
SELECT 
    tp.id_trabajo_programado,
    tp.nro_fila,
    
    -- Planificación
    ps.semana_numero,
    ps.mes,
    ps.anio,
    ps.fecha_inicio AS semana_inicio,
    ps.fecha_fin AS semana_fin,
    
    -- Trabajo
    tp.descripcion_trabajo,
    tp.area_trabajo,
    tp.direccion_colocacion,
    tp.contacto_cliente,
    
    -- Programación
    tp.fecha_programada,
    tp.hora_programada,
    tp.estado_cumplimiento,
    tp.fecha_real_entrega,
    
    -- Trabajador asignado
    tp.id_trabajador_asignado,
    CONCAT(p_trabajador.nombre, ' ', p_trabajador.apellido_paterno) AS nombre_trabajador,
    
    -- Cotizador
    tp.id_cotizador,
    CONCAT(p_cotizador.nombre, ' ', p_cotizador.apellido_paterno) AS nombre_cotizador,
    
    -- Pedido relacionado
    tp.id_pedido,
    ped.total AS total_pedido,
    ped.estado_pedido,
    
    -- Cliente (del pedido)
    COALESCE(
        CONCAT(pc.nombre, ' ', pc.apellido_paterno),
        emp.razon_social
    ) AS nombre_cliente,
    
    -- Observaciones
    tp.observaciones,
    tp.motivo_incumplimiento
    
FROM trabajo_programado tp
INNER JOIN planificacion_semanal ps ON tp.id_planificacion = ps.id_planificacion
LEFT JOIN empleado emp_trab ON tp.id_trabajador_asignado = emp_trab.id_empleado
LEFT JOIN personas p_trabajador ON emp_trab.id_persona = p_trabajador.id_persona
LEFT JOIN usuarios u_cotizador ON tp.id_cotizador = u_cotizador.id_usuario
LEFT JOIN personas p_cotizador ON u_cotizador.id_persona = p_cotizador.id_persona
LEFT JOIN pedidos ped ON tp.id_pedido = ped.id_pedido
LEFT JOIN clientes cli ON ped.id_cliente = cli.id_cliente
LEFT JOIN personas pc ON cli.id_persona = pc.id_persona
LEFT JOIN empresas emp ON cli.id_empresa = emp.id_empresa

ORDER BY ps.anio DESC, ps.mes DESC, ps.semana_numero DESC, tp.fecha_programada, tp.hora_programada;

COMMENT ON VIEW vista_trabajos_programados_detalle IS 'Vista detallada de todos los trabajos programados con información completa';


-- ============================================
-- EJEMPLOS DE USO
-- ============================================

/*
-- Ejemplo 1: Crear planificación para la semana del 10 al 15 de noviembre
SELECT crear_planificacion_semanal('2025-11-10'::DATE, 1);

-- Ejemplo 2: Insertar trabajo programado
INSERT INTO trabajo_programado (
    id_planificacion, id_pedido, nro_fila,
    descripcion_trabajo, area_trabajo, direccion_colocacion,
    id_trabajador_asignado, id_cotizador,
    fecha_programada, hora_programada,
    observaciones
) VALUES (
    1, 123, 1,
    'CAMBIO DE LONA ROLLERS', 'ENSAMBLAJE', 'OFICINA URBAN',
    5, 2,
    '2025-11-10', '15:00',
    'Cliente: SOCIEDAD BOLIVIANA DE TERAPIA INTENSIVA'
);

-- Ejemplo 3: Ver resumen de la semana 2 de noviembre 2025
SELECT * FROM vista_resumen_planificacion
WHERE semana_numero = 2 AND mes = 11 AND anio = 2025;

-- Ejemplo 4: Ver todos los trabajos de una semana específica
SELECT * FROM vista_trabajos_programados_detalle
WHERE semana_numero = 2 AND mes = 11 AND anio = 2025
ORDER BY fecha_programada, hora_programada;

-- Ejemplo 5: Marcar trabajo como completado
UPDATE trabajo_programado
SET estado_cumplimiento = 'COMPLETADO',
    fecha_real_entrega = CURRENT_TIMESTAMP
WHERE id_trabajo_programado = 1;

-- Ejemplo 6: Reprogramar un trabajo
INSERT INTO historial_reprogramacion (
    id_trabajo_programado, fecha_original, hora_original,
    fecha_nueva, hora_nueva, motivo, usuario_reprogramo
) VALUES (
    1, '2025-11-10', '15:00',
    '2025-11-12', '10:00',
    'Cliente solicitó cambio de fecha', 2
);

UPDATE trabajo_programado
SET fecha_programada = '2025-11-12',
    hora_programada = '10:00',
    estado_cumplimiento = 'REPROGRAMADO'
WHERE id_trabajo_programado = 1;

-- Ejemplo 7: Obtener trabajos pendientes de la semana actual
SELECT * FROM vista_trabajos_programados_detalle
WHERE estado_cumplimiento = 'PENDIENTE'
  AND fecha_programada BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '6 days'
ORDER BY fecha_programada, hora_programada;
*/
select * from pedidos
select * from pagos_pedido