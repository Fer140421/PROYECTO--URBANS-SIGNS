-- =========================================================================
-- SISTEMA DE GESTION URBAN SIGNS SRL - SCRIPT COMPLETO DE BASE DE DATOS
-- Creacion limpia de tablas, tipos, relaciones, vistas e indices
-- =========================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
  SELECT unaccent('public.unaccent', $1)
$$ LANGUAGE SQL IMMUTABLE;

-- 2. TIPOS ENUMERADOS
CREATE TYPE sesion_estado AS ENUM ('ACTIVO', 'CERRADO');
CREATE TYPE tipo_control_enum AS ENUM ('UNIDAD', 'ROLLO', 'PLANO', 'METRO2');
CREATE TYPE estado_compra AS ENUM ('Pendiente', 'Completada', 'Cancelada');
CREATE TYPE tipo_movimiento_enum AS ENUM ('COMPRA', 'SALIDA', 'SOBRANTE', 'DESECHO');
CREATE TYPE estado_herramienta_enum AS ENUM ('DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'DADO_DE_BAJA');
CREATE TYPE tipo_movimiento_herramienta_enum AS ENUM ('ASIGNACION', 'DEVOLUCION', 'BAJA', 'MANTENIMIENTO');
CREATE TYPE tipo_prestamo_enum AS ENUM ('DIARIO', 'PROYECTO', 'INDEFINIDO');
CREATE TYPE estado_residuo_enum AS ENUM ('DISPONIBLE', 'USADO', 'DESCARTADO');

-- 3. TABLAS BASE DE AUTENTICACION Y PERSONAL
CREATE TABLE people (
    id_people BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ci VARCHAR(255) NOT NULL,
    name_people VARCHAR(255) NOT NULL,
    ap VARCHAR(255),
    am VARCHAR(255),
    phone_number VARCHAR(255) NOT NULL,
    addres TEXT
);

CREATE TABLE roles (
    id_role BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name_role VARCHAR(255) NOT NULL,
    state BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
    id_user BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_people BIGINT NOT NULL,
    user_acces VARCHAR(255) UNIQUE NOT NULL,
    password_acces VARCHAR(255) NOT NULL,
    status_user BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until TIMESTAMPTZ NULL,
    CONSTRAINT fk_users_people FOREIGN KEY (id_people) REFERENCES people(id_people)
);

CREATE TABLE users_roles (
    id_role BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    date_assigned TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id_role, id_user),
    CONSTRAINT fk_users_roles_role FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
    CONSTRAINT fk_users_roles_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE employees (
    id_employee BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_people BIGINT NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE,
    foto VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_employees_people FOREIGN KEY (id_people) REFERENCES people(id_people)
);

CREATE TABLE suppliers (
    id_supplier BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_people BIGINT NOT NULL,
    city VARCHAR(100),
    status BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_suppliers_people FOREIGN KEY (id_people) REFERENCES people(id_people)
);

-- Vistas de compatibilidad (nombres en espanol para consultas legacy)
CREATE OR REPLACE VIEW personas AS
    SELECT id_people AS id_persona, ci, name_people AS nombre, ap AS apellido_paterno, am AS apellido_materno, phone_number AS numero_telefono, addres AS direccion
    FROM people;

CREATE OR REPLACE VIEW usuarios AS
    SELECT id_user AS id_usuario, id_people AS id_persona, user_acces AS usuario_acceso, password_acces AS contrasena_acceso, status_user AS estado_usuario, failed_login_attempts, locked_until
    FROM users;

CREATE OR REPLACE VIEW empleado AS
    SELECT id_employee AS id_empleado, id_people AS id_persona, hire_date AS fecha_contratacion, foto, status AS estado
    FROM employees;

CREATE OR REPLACE VIEW proveedores AS
    SELECT id_supplier AS id_proveedor, id_people AS id_persona, city AS ciudad, status AS estado
    FROM suppliers;

-- 4. SESIONES Y SEGURIDAD
CREATE TABLE sesion (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    login_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_fin TIMESTAMP NULL,
    ip_direccion VARCHAR(255),
    dispositivo VARCHAR(255),
    estado sesion_estado NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario) REFERENCES users(id_user)
);

CREATE TABLE sesion_accion (
    id_accion SERIAL PRIMARY KEY,
    id_sesion INT NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(100),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sesion_accion FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    id_refresh_token BIGSERIAL PRIMARY KEY,
    id_sesion INT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP NOT NULL,
    usado_en TIMESTAMP NULL,
    revocado_en TIMESTAMP NULL,
    reemplazado_por BIGINT NULL,
    CONSTRAINT fk_refresh_token_sesion FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE,
    CONSTRAINT fk_refresh_token_reemplazado FOREIGN KEY (reemplazado_por) REFERENCES refresh_token(id_refresh_token)
);

CREATE INDEX idx_refresh_token_sesion ON refresh_token(id_sesion);
CREATE INDEX idx_refresh_token_activo ON refresh_token(expira_en) WHERE revocado_en IS NULL;

CREATE TABLE password_recovery (
    user_id BIGINT PRIMARY KEY,
    code_hash VARCHAR(64),
    code_expires_at TIMESTAMP WITH TIME ZONE,
    token_hash VARCHAR(64),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_password_recovery_user FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
);

-- 5. MATERIALES, CATEGORIAS E INVENTARIO
CREATE TABLE Categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL CHECK (char_length(nombre) > 0),
    descripcion VARCHAR(50),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX idx_nombre_categoria_unico ON Categorias (LOWER(immutable_unaccent(nombre)));

CREATE TABLE unidades_medida (
    id_unidad SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    abreviatura VARCHAR(10) NOT NULL UNIQUE,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE material_produccion (
    id_material SERIAL PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_unidad INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    caracteristica VARCHAR(50),
    color VARCHAR(50),
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    foto VARCHAR(255),
    estado BOOLEAN DEFAULT TRUE,
    tipo_control tipo_control_enum NOT NULL DEFAULT 'UNIDAD',
    ancho_rollo NUMERIC(10,3),
    largo_rollo_nuevo NUMERIC(10,2),
    ancho_plancha NUMERIC(10,3),
    alto_plancha NUMERIC(10,3),
    m2_por_plancha NUMERIC(10,4),
    stock_minimo NUMERIC(10,3) NOT NULL DEFAULT 0,
    porcentaje_desperdicio NUMERIC(5,2) DEFAULT 10.00,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria),
    CONSTRAINT fk_unidad FOREIGN KEY (id_unidad) REFERENCES unidades_medida(id_unidad)
);

CREATE TABLE Compras (
    id_compra SERIAL PRIMARY KEY,
    id_proveedor BIGINT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado estado_compra NOT NULL DEFAULT 'Pendiente',
    total NUMERIC(10,2) NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES suppliers(id_supplier)
);

CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL,
    id_material INT NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_detalle_compra FOREIGN KEY (id_compra) REFERENCES Compras(id_compra) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_material FOREIGN KEY (id_material) REFERENCES material_produccion(id_material)
);

CREATE TABLE lotes_material (
    id_lote SERIAL PRIMARY KEY,
    id_material INT NOT NULL,
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    id_compra INT,
    fecha_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cantidad_inicial NUMERIC(10,3) NOT NULL,
    cantidad_actual NUMERIC(10,3) NOT NULL,
    ancho_rollo NUMERIC(10,3),
    metros_lineales_actuales NUMERIC(10,2),
    ubicacion VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_material_lote FOREIGN KEY (id_material) REFERENCES material_produccion(id_material),
    CONSTRAINT fk_compra_lote FOREIGN KEY (id_compra) REFERENCES Compras(id_compra),
    CONSTRAINT check_cantidad_positiva CHECK (cantidad_actual >= 0)
);

CREATE TABLE entradas (
    id_entrada SERIAL PRIMARY KEY,
    id_material INT NOT NULL,
    id_lote INT,
    responsable BIGINT NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    CONSTRAINT fk_entrada_material FOREIGN KEY (id_material) REFERENCES material_produccion(id_material),
    CONSTRAINT fk_entrada_lote FOREIGN KEY (id_lote) REFERENCES lotes_material(id_lote),
    CONSTRAINT fk_entrada_responsable FOREIGN KEY (responsable) REFERENCES users(id_user)
);

CREATE TABLE movimiento_stock (
    id_movimiento_stock SERIAL PRIMARY KEY,
    id_material INT NOT NULL,
    id_lote INT,
    id_compra INT,
    id_entrada INT,
    id_usuario BIGINT NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL,
    tipo_movimiento tipo_movimiento_enum NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_trabajo INT,
    cliente VARCHAR(100),
    descripcion TEXT,
    CONSTRAINT fk_mov_material FOREIGN KEY (id_material) REFERENCES material_produccion(id_material),
    CONSTRAINT fk_mov_lote FOREIGN KEY (id_lote) REFERENCES lotes_material(id_lote),
    CONSTRAINT fk_mov_entrada FOREIGN KEY (id_entrada) REFERENCES entradas(id_entrada),
    CONSTRAINT fk_mov_usuario FOREIGN KEY (id_usuario) REFERENCES users(id_user),
    CONSTRAINT fk_mov_compras FOREIGN KEY (id_compra) REFERENCES Compras(id_compra)
);

CREATE TABLE residuos_material (
    id_residuo SERIAL PRIMARY KEY,
    id_material INT NOT NULL,
    id_lote_origen INT,
    cantidad NUMERIC(10,3) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    ubicacion VARCHAR(100),
    estado estado_residuo_enum DEFAULT 'DISPONIBLE',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    CONSTRAINT fk_residuo_material FOREIGN KEY (id_material) REFERENCES material_produccion(id_material),
    CONSTRAINT fk_residuo_lote FOREIGN KEY (id_lote_origen) REFERENCES lotes_material(id_lote)
);

-- 6. HERRAMIENTAS Y PRESTAMOS DE MATERIAL/TRABAJO
CREATE TABLE herramientas (
    id_herramienta SERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    foto VARCHAR(255),
    estado_actual estado_herramienta_enum DEFAULT 'DISPONIBLE',
    ubicacion VARCHAR(100),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE movimiento_herramientas (
    id_movimiento SERIAL PRIMARY KEY,
    id_herramienta INT NOT NULL,
    tipo_movimiento tipo_movimiento_herramienta_enum NOT NULL,
    responsable BIGINT,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mov_herramienta FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    CONSTRAINT fk_mov_herramienta_responsable FOREIGN KEY (responsable) REFERENCES users(id_user)
);

CREATE TABLE prestamos_material_trabajo (
    id_prestamo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empleado BIGINT NOT NULL,
    id_pedido BIGINT NULL,
    fecha_prestamo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion TIMESTAMP,
    tipo_prestamo tipo_prestamo_enum NOT NULL DEFAULT 'DIARIO',
    observacion TEXT,
    estado VARCHAR(10) NOT NULL CHECK (estado IN ('Entregado', 'Prestado')),
    CONSTRAINT fk_prestamo_empleado FOREIGN KEY (id_empleado)
        REFERENCES employees (id_employee)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE detalle_prestamo (
    id_detalle_prestamo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prestamo BIGINT NOT NULL,
    id_herramienta BIGINT NOT NULL,
    CONSTRAINT fk_detalle_prestamo_prestamo FOREIGN KEY (id_prestamo)
        REFERENCES prestamos_material_trabajo (id_prestamo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_detalle_prestamo_herramienta FOREIGN KEY (id_herramienta)
        REFERENCES herramientas (id_herramienta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_prestamos_material_trabajo_empleado ON prestamos_material_trabajo (id_empleado);
CREATE INDEX idx_prestamos_material_trabajo_pedido ON prestamos_material_trabajo (id_pedido);
CREATE INDEX idx_detalle_prestamo_herramienta ON detalle_prestamo (id_herramienta);

-- 7. CLIENTES, COTIZACIONES Y TRABAJOS
CREATE TABLE empresas (
    id_empresa SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20)
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_persona BIGINT UNIQUE REFERENCES people(id_people),
    id_empresa INT UNIQUE REFERENCES empresas(id_empresa),
    id_user BIGINT UNIQUE REFERENCES users(id_user),
    tipo_cliente_persona_empresa VARCHAR(10) NOT NULL CHECK (tipo_cliente_persona_empresa IN ('Persona', 'Empresa')),
    tipo_cliente VARCHAR(15) CHECK (tipo_cliente IN ('normal', 'destacado')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    correo VARCHAR(255),
    CONSTRAINT ck_clientes_titular_exclusivo CHECK (
        (tipo_cliente_persona_empresa = 'Persona' AND id_persona IS NOT NULL AND id_empresa IS NULL)
        OR
        (tipo_cliente_persona_empresa = 'Empresa' AND id_empresa IS NOT NULL AND id_persona IS NULL)
    )
);

CREATE TABLE trabajos (
    id_trabajo SERIAL PRIMARY KEY,
    foto VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE solicitud_cotizacion (
    id_solicitud SERIAL PRIMARY KEY,
    cod_solicitud VARCHAR(50) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'REVISION', 'COTIZADA', 'CANCELADA')),
    observaciones TEXT,
    CONSTRAINT fk_cliente_solicitud FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE solicitud_trabajo (
    id_solicitud_trabajo SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_trabajo INT NOT NULL,
    cantidad INT DEFAULT 1,
    base DECIMAL(10,2),
    altura DECIMAL(10,2),
    area_total DECIMAL(10,2),
    descripcion TEXT,
    CONSTRAINT fk_solicitud_trabajo_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud_cotizacion(id_solicitud) ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_trabajo_trabajo FOREIGN KEY (id_trabajo) REFERENCES trabajos(id_trabajo)
);

CREATE TABLE cotizaciones (
    id_cotizacion SERIAL PRIMARY KEY,
    cod_cotizacion VARCHAR(50) NOT NULL UNIQUE,
    id_solicitud INT NOT NULL,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_caducado DATE,
    costo_total DECIMAL(12,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'APROBADA', 'RECHAZADA')),
    CONSTRAINT fk_cotizacion_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud_cotizacion(id_solicitud)
);

CREATE TABLE cotizacion_trabajo (
    id_cotizacion_trabajo SERIAL PRIMARY KEY,
    id_cotizacion INT NOT NULL,
    id_solicitud_trabajo INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(12,2),
    subtotal DECIMAL(12,2),
    CONSTRAINT fk_cotizacion_trabajo_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    CONSTRAINT fk_cotizacion_trabajo_solicitud FOREIGN KEY (id_solicitud_trabajo) REFERENCES solicitud_trabajo(id_solicitud_trabajo) ON DELETE CASCADE
);

CREATE TABLE detalle_cotizacion (
    id_detalle_cotizacion SERIAL PRIMARY KEY,
    id_cotizacion_trabajo INT NOT NULL,
    id_material INT NOT NULL,
    CONSTRAINT fk_detalle_cot_trabajo FOREIGN KEY (id_cotizacion_trabajo) REFERENCES cotizacion_trabajo(id_cotizacion_trabajo) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_cot_material FOREIGN KEY (id_material) REFERENCES material_produccion(id_material) ON DELETE CASCADE
);

-- 8. PEDIDOS, FACTURACION Y SEGUIMIENTO DE ENTREGAS
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cotizacion INT NOT NULL,
    id_cliente INT NOT NULL,
    fecha_pedido DATE DEFAULT CURRENT_DATE,
    estado_pedido VARCHAR(20) DEFAULT 'PENDIENTE'
        CHECK (estado_pedido IN ('PENDIENTE', 'EN_PROCESO', 'EN_TALLER', 'FINALIZADO', 'ENTREGADO', 'CANCELADO')),
    estado_pago VARCHAR(20) DEFAULT 'SIN_PAGAR'
        CHECK (estado_pago IN ('SIN_PAGAR', 'ANTICIPO_PAGADO', 'PAGADO_COMPLETO')),
    anticipo DECIMAL(12,2) DEFAULT 0,
    saldo_pendiente DECIMAL(12,2) DEFAULT 0,
    facturado BOOLEAN DEFAULT FALSE,
    total DECIMAL(12,2) DEFAULT 0,

    -- Campos para entrega fisica y App Movil
    fecha_entrega_real TIMESTAMP NULL,
    foto_evidencia VARCHAR(500) NULL,
    observacion_entrega TEXT NULL,
    entregado_por BIGINT NULL,
    latitud_entrega DECIMAL(10,8) NULL,
    longitud_entrega DECIMAL(11,8) NULL,

    CONSTRAINT fk_pedido_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_pedido_entregador FOREIGN KEY (entregado_por) REFERENCES employees(id_employee) ON DELETE SET NULL
);

-- Clave foranea diferida entre prestamos_material_trabajo y pedidos
ALTER TABLE prestamos_material_trabajo
    ADD CONSTRAINT fk_prestamo_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
    ON DELETE SET NULL;

CREATE TABLE pagos_pedido (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    fecha_pago DATE DEFAULT CURRENT_DATE,
    monto DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(30) CHECK (metodo_pago IN ('EFECTIVO', 'QR', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE')),
    observacion TEXT,
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);

CREATE TABLE orden_impresion (
    id_orden SERIAL PRIMARY KEY,
    nro_orden VARCHAR(50) UNIQUE NOT NULL,
    id_pedido INT NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responsable BIGINT,
    observaciones TEXT,
    archivo_adjunto TEXT,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'RECEPCIONADO')),
    CONSTRAINT fk_orden_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_orden_responsable FOREIGN KEY (responsable) REFERENCES users(id_user) ON DELETE SET NULL
);

CREATE TABLE detalle_orden_impresion (
    id_orden_trabajo SERIAL PRIMARY KEY,
    id_orden INT NOT NULL,
    id_cotizacion_trabajo INT NOT NULL,
    observaciones TEXT,
    CONSTRAINT fk_orden_trabajo FOREIGN KEY (id_orden) REFERENCES orden_impresion(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_cot_trabajo FOREIGN KEY (id_cotizacion_trabajo) REFERENCES cotizacion_trabajo(id_cotizacion_trabajo) ON DELETE CASCADE
);

CREATE TABLE planificacion_semanal (
    id_planificacion SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    creado_por BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    CONSTRAINT fk_planificacion_creador FOREIGN KEY (creado_por) REFERENCES users(id_user)
);

CREATE TABLE trabajo_programado (
    id_trabajo_programado SERIAL PRIMARY KEY,
    id_planificacion INT NOT NULL,
    id_pedido INT,
    id_orden_impresion INT,
    cliente VARCHAR(255),
    descripcion_trabajo TEXT NOT NULL,
    area_trabajo VARCHAR(100),
    direccion TEXT,
    id_trabajador_asignado BIGINT,
    trabajador VARCHAR(255),
    fecha_programada DATE NOT NULL,
    hora_programada TIME,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'REPROGRAMADO')),
    cumplido BOOLEAN,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trabajo_planificacion FOREIGN KEY (id_planificacion) REFERENCES planificacion_semanal(id_planificacion) ON DELETE CASCADE,
    CONSTRAINT fk_trabajo_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
    CONSTRAINT fk_trabajo_orden FOREIGN KEY (id_orden_impresion) REFERENCES orden_impresion(id_orden) ON DELETE SET NULL,
    CONSTRAINT fk_trabajo_prog_trabajador FOREIGN KEY (id_trabajador_asignado) REFERENCES employees(id_employee) ON DELETE SET NULL
);

CREATE TABLE reprogramacion_trabajo (
    id_reprogramacion SERIAL PRIMARY KEY,
    id_trabajo_programado INT NOT NULL,
    fecha_original DATE NOT NULL,
    fecha_nueva DATE NOT NULL,
    motivo TEXT,
    usuario_reprogramo BIGINT,
    fecha_reprogramacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reprog_trabajo FOREIGN KEY (id_trabajo_programado) REFERENCES trabajo_programado(id_trabajo_programado) ON DELETE CASCADE,
    CONSTRAINT fk_reprog_usuario FOREIGN KEY (usuario_reprogramo) REFERENCES users(id_user)
);

CREATE TABLE facturacion (
    id SERIAL PRIMARY KEY,
    id_pedido INT,
    cuf VARCHAR(255),
    numero_factura_siat BIGINT,
    fecha_emision_siat TIMESTAMP,
    leyenda VARCHAR(255),
    url_qr VARCHAR(255),
    estado VARCHAR(255) NOT NULL,
    json_enviado TEXT,
    json_recibido TEXT,
    mensajes_error TEXT,
    CONSTRAINT fk_facturacion_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);

-- 9. PERMISOS Y ROLES DINAMICOS
CREATE TABLE permisos (
    id_permiso SERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles_permisos (
    id_role BIGINT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_role, id_permiso),
    CONSTRAINT fk_roles_permisos_rol FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
    CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE
);

-- 10. FUNCIONES, TRIGGERS Y VISTAS DE STOCK
CREATE OR REPLACE FUNCTION actualizar_stock_fifo()
RETURNS TRIGGER AS $$
DECLARE
    cantidad_a_descontar NUMERIC(10,3);
    lote_actual RECORD;
BEGIN
    IF NEW.tipo_movimiento IN ('SALIDA', 'DESECHO', 'SOBRANTE') THEN
        cantidad_a_descontar := NEW.cantidad;

        IF NEW.id_lote IS NOT NULL THEN
            UPDATE lotes_material
            SET cantidad_actual = GREATEST(cantidad_actual - cantidad_a_descontar, 0)
            WHERE id_lote = NEW.id_lote;

            UPDATE lotes_material
            SET activo = FALSE
            WHERE id_lote = NEW.id_lote AND cantidad_actual = 0;
        ELSE
            FOR lote_actual IN
                SELECT *
                FROM lotes_material
                WHERE id_material = NEW.id_material
                  AND cantidad_actual > 0
                ORDER BY fecha_ingreso ASC
            LOOP
                IF lote_actual.cantidad_actual >= cantidad_a_descontar THEN
                    UPDATE lotes_material
                    SET cantidad_actual = cantidad_actual - cantidad_a_descontar
                    WHERE id_lote = lote_actual.id_lote;

                    UPDATE lotes_material
                    SET activo = FALSE
                    WHERE id_lote = lote_actual.id_lote AND cantidad_actual = 0;

                    NEW.id_lote := lote_actual.id_lote;
                    EXIT;
                ELSE
                    cantidad_a_descontar := cantidad_a_descontar - lote_actual.cantidad_actual;

                    UPDATE lotes_material
                    SET cantidad_actual = 0, activo = FALSE
                    WHERE id_lote = lote_actual.id_lote;
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock_fifo
AFTER INSERT ON movimiento_stock
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_fifo();

CREATE OR REPLACE VIEW vista_stock_disponible AS
SELECT 
    m.id_material,
    m.nombre AS nombre_material, 
    m.foto AS foto,
    u.abreviatura AS unidad_abrev, 
    c.nombre AS nombre_categoria, 
    COALESCE(SUM(l.cantidad_actual), 0)::INTEGER AS stock_total, 
    m.stock_minimo::INTEGER AS stock_minimo,
    CASE 
        WHEN COALESCE(SUM(l.cantidad_actual), 0) = 0 THEN 'AGOTADO' 
        WHEN COALESCE(SUM(l.cantidad_actual), 0) <= m.stock_minimo THEN 'BAJO STOCK' 
        ELSE 'EN STOCK' 
    END AS estado_stock 
FROM material_produccion m 
LEFT JOIN lotes_material l ON l.id_material = m.id_material AND l.activo = TRUE 
LEFT JOIN unidades_medida u ON m.id_unidad = u.id_unidad 
LEFT JOIN categorias c ON m.id_categoria = c.id_categoria 
GROUP BY m.id_material, m.nombre, u.abreviatura, c.nombre, m.stock_minimo, m.foto 
ORDER BY m.nombre;

CREATE OR REPLACE VIEW vista_lotes_terminados AS
SELECT 
    l.id_lote,
    m.nombre AS material,
    l.codigo_lote,
    l.cantidad_inicial,
    l.cantidad_actual,
    l.fecha_ingreso,
    COALESCE(SUM(CASE WHEN ms.tipo_movimiento = 'SALIDA' THEN ms.cantidad END), 0) AS total_usado,
    COALESCE(SUM(CASE WHEN ms.tipo_movimiento = 'DESECHO' THEN ms.cantidad END), 0) AS total_desechado,
    COUNT(ms.id_movimiento_stock) AS movimientos
FROM 
    lotes_material l
JOIN 
    material_produccion m ON l.id_material = m.id_material
LEFT JOIN 
    movimiento_stock ms ON l.id_lote = ms.id_lote
WHERE 
    l.cantidad_actual = 0
GROUP BY 
    l.id_lote, m.nombre, l.codigo_lote, l.cantidad_inicial, l.cantidad_actual, l.fecha_ingreso;
