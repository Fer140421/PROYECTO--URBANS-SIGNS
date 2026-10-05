-- =========================================================================
-- URBAN SIGNS SRL - SCRIPT MAESTRO LIMPIO DEFINITIVO V2 (CORREGIDO)
-- Arquitectura: 2 Roles Operativos (OFICINA y TALLER) + Cliente Web
-- Columnas y tipos 100% alineados con los modelos JPA de Spring Boot
-- =========================================================================

-- 1. RECREACIÓN LIMPIA DEL ESQUEMA PUBLIC
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
  SELECT unaccent('public.unaccent', $1)
$$ LANGUAGE SQL IMMUTABLE;

-- 3. TIPOS ENUMERADOS
CREATE TYPE sesion_estado AS ENUM ('ACTIVO', 'CERRADO');
CREATE TYPE estado_herramienta_enum AS ENUM ('DISPONIBLE', 'EN_USO', 'EN_MANTENIMIENTO', 'DADO_DE_BAJA');
CREATE TYPE tipo_movimiento_herramienta_enum AS ENUM ('ASIGNACION', 'DEVOLUCION', 'BAJA', 'MANTENIMIENTO');
CREATE TYPE tipo_prestamo_enum AS ENUM ('DIARIO', 'PROYECTO', 'INDEFINIDO');

-- =========================================================================
-- 4. AUTENTICACIÓN, PERSONAS Y PERSONAL
-- =========================================================================

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
    name_role VARCHAR(255) NOT NULL UNIQUE,
    state BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
    id_user BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_people BIGINT NOT NULL,
    user_acces VARCHAR(255) UNIQUE NOT NULL,
    password_acces VARCHAR(255) NOT NULL,
    state_user BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until TIMESTAMPTZ NULL,
    CONSTRAINT fk_users_people FOREIGN KEY (id_people) REFERENCES people(id_people)
);

CREATE TABLE users_roles (
    id_role BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    asign_date TIMESTAMP(6) DEFAULT NOW(),
    PRIMARY KEY (id_role, id_user),
    CONSTRAINT fk_users_roles_role FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
    CONSTRAINT fk_users_roles_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE employees (
    id_employee BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_people BIGINT NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE,
    foto VARCHAR(255) NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_employees_people FOREIGN KEY (id_people) REFERENCES people(id_people)
);

CREATE TABLE sesion (
    id_sesion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    login_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    login_fin TIMESTAMPTZ NULL,
    ip_direccion VARCHAR(255) NULL,
    dispositivo VARCHAR(255) NULL,
    estado VARCHAR(255) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario) REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE sesion_accion (
    id_accion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sesion BIGINT NOT NULL,
    descripcion TEXT NULL,
    modulo VARCHAR(100) NULL,
    fecha_accion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sesion_accion_sesion FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE
);

CREATE TABLE refresh_token (
    id_refresh_token BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sesion BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expira_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ NULL,
    revocado_en TIMESTAMPTZ NULL,
    reemplazado_por VARCHAR(64) NULL,
    CONSTRAINT fk_refresh_token_sesion FOREIGN KEY (id_sesion) REFERENCES sesion(id_sesion) ON DELETE CASCADE
);

CREATE TABLE password_recovery (
    userid BIGINT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    codeexpiresat TIMESTAMPTZ NULL,
    codehash VARCHAR(64) NULL,
    nextsendat TIMESTAMPTZ NULL,
    tokenexpiresat TIMESTAMPTZ NULL,
    tokenhash VARCHAR(64) NULL,
    CONSTRAINT fk_password_recovery_user FOREIGN KEY (userid) REFERENCES users(id_user) ON DELETE CASCADE
);

-- =========================================================================
-- 5. ACTIVOS Y HERRAMIENTAS DE TALLER
-- =========================================================================

CREATE TABLE herramientas (
    id_herramienta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NULL,
    modelo VARCHAR(100) NULL,
    foto VARCHAR(255) NULL,
    estado_actual VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    ubicacion VARCHAR(100) NULL,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    observaciones TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE movimiento_herramientas (
    id_movimiento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_herramienta BIGINT NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL,
    responsable BIGINT NULL,
    descripcion TEXT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_mov_herramienta FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta),
    CONSTRAINT fk_mov_herramienta_responsable FOREIGN KEY (responsable) REFERENCES users(id_user)
);

-- =========================================================================
-- 6. CLIENTES Y EMPRESAS
-- =========================================================================

CREATE TABLE empresas (
    id_empresa BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20)
);

CREATE TABLE clientes (
    id_cliente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_persona BIGINT NULL,
    id_empresa BIGINT NULL,
    tipo_cliente_persona_empresa VARCHAR(10) NOT NULL CHECK (tipo_cliente_persona_empresa IN ('Persona', 'Empresa')),
    tipo_cliente VARCHAR(15) NOT NULL CHECK (tipo_cliente IN ('normal', 'destacado')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    correo VARCHAR(255),
    id_user BIGINT NULL UNIQUE,
    CONSTRAINT fk_clientes_persona FOREIGN KEY (id_persona) REFERENCES people(id_people),
    CONSTRAINT fk_clientes_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
    CONSTRAINT fk_clientes_usuario FOREIGN KEY (id_user) REFERENCES users(id_user)
);

-- =========================================================================
-- 7. CATÁLOGO DE TRABAJOS Y SOLICITUDES
-- =========================================================================

CREATE TABLE trabajos (
    id_trabajo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    foto VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE solicitud_cotizacion (
    id_solicitud BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_solicitud VARCHAR(50) NOT NULL UNIQUE,
    id_cliente BIGINT NOT NULL,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'REVISION', 'COTIZADA', 'CANCELADA')),
    observaciones TEXT,
    origen VARCHAR(20) DEFAULT 'DASHBOARD',
    archivo_referencia VARCHAR(500),
    CONSTRAINT fk_solicitud_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE solicitud_trabajo (
    id_solicitud_trabajo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    id_trabajo BIGINT NOT NULL,
    cantidad INT DEFAULT 1,
    unidad_medida VARCHAR(10) NOT NULL DEFAULT 'm',
    base NUMERIC(10,2),
    altura NUMERIC(10,2),
    area_total NUMERIC(12,4),
    descripcion TEXT,
    material VARCHAR(255),
    archivo_referencia VARCHAR(500),
    CONSTRAINT fk_sol_trabajo_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud_cotizacion(id_solicitud) ON DELETE CASCADE,
    CONSTRAINT fk_sol_trabajo_trabajo FOREIGN KEY (id_trabajo) REFERENCES trabajos(id_trabajo)
);

-- =========================================================================
-- 8. COTIZACIONES FORMALES
-- =========================================================================

CREATE TABLE cotizaciones (
    id_cotizacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cotizacion VARCHAR(20) NOT NULL UNIQUE,
    id_solicitud BIGINT NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_caducado DATE NOT NULL,
    costo_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'CADUCADA')),
    CONSTRAINT fk_cotizacion_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitud_cotizacion(id_solicitud)
);

CREATE TABLE cotizacion_trabajo (
    id_cotizacion_trabajo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cotizacion BIGINT NOT NULL,
    id_solicitud_trabajo BIGINT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario NUMERIC(12,2),
    subtotal NUMERIC(12,2),
    unidad_medida VARCHAR(10) NOT NULL DEFAULT 'm',
    base NUMERIC(10,2),
    altura NUMERIC(10,2),
    area_total NUMERIC(12,4),
    material VARCHAR(255),
    CONSTRAINT fk_cot_trabajo_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id_cotizacion) ON DELETE CASCADE,
    CONSTRAINT fk_cot_trabajo_sol_trabajo FOREIGN KEY (id_solicitud_trabajo) REFERENCES solicitud_trabajo(id_solicitud_trabajo)
);

-- =========================================================================
-- 9. PEDIDOS Y PAGOS
-- =========================================================================

CREATE TABLE pedidos (
    id_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cotizacion BIGINT NOT NULL,
    id_cliente BIGINT NOT NULL,
    fecha_pedido DATE DEFAULT CURRENT_DATE,
    estado_pedido VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_pedido IN ('PENDIENTE', 'EN_PROCESO', 'EN_TALLER', 'FINALIZADO', 'ENTREGADO', 'CANCELADO')),
    estado_pago VARCHAR(20) NOT NULL DEFAULT 'SIN_PAGAR' CHECK (estado_pago IN ('SIN_PAGAR', 'ANTICIPO_PAGADO', 'PAGADO_COMPLETO')),
    anticipo NUMERIC(12,2) DEFAULT 0,
    saldo_pendiente NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    facturado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_entrega_real TIMESTAMPTZ NULL,
    foto_evidencia VARCHAR(500) NULL,
    observacion_entrega TEXT NULL,
    entregado_por BIGINT NULL,
    latitud_entrega NUMERIC(10,8) NULL,
    longitud_entrega NUMERIC(11,8) NULL,
    CONSTRAINT fk_pedidos_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizaciones(id_cotizacion),
    CONSTRAINT fk_pedidos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_pedidos_entregador FOREIGN KEY (entregado_por) REFERENCES employees(id_employee)
);

CREATE TABLE pagos_pedido (
    id_pago BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    fecha_pago DATE DEFAULT CURRENT_DATE,
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago VARCHAR(30) CHECK (metodo_pago IN ('EFECTIVO', 'QR', 'TRANSFERENCIA')),
    observacion TEXT,
    CONSTRAINT fk_pagos_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE
);

-- =========================================================================
-- 10. PRÉSTAMOS DE HERRAMIENTAS DE TRABAJO
-- =========================================================================

CREATE TABLE prestamos_material_trabajo (
    id_prestamo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_empleado BIGINT NOT NULL,
    id_pedido BIGINT NULL,
    fecha_prestamo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_devolucion TIMESTAMPTZ NULL,
    tipo_prestamo VARCHAR(255) NOT NULL DEFAULT 'DIARIO',
    observacion VARCHAR(255) NULL,
    estado VARCHAR(10) NOT NULL CHECK (estado IN ('Entregado', 'Prestado')),
    CONSTRAINT fk_prestamo_empleado FOREIGN KEY (id_empleado) REFERENCES employees(id_employee),
    CONSTRAINT fk_prestamo_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

CREATE TABLE detalle_prestamo (
    id_detalle_prestamo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prestamo BIGINT NOT NULL,
    id_herramienta BIGINT NOT NULL,
    CONSTRAINT fk_detalle_prestamo_p FOREIGN KEY (id_prestamo) REFERENCES prestamos_material_trabajo(id_prestamo) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_prestamo_h FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta)
);

-- =========================================================================
-- 11. ÓRDENES DE IMPRESIÓN Y PLANIFICACIÓN / PLANNER
-- =========================================================================

CREATE TABLE orden_impresion (
    id_orden BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nro_orden VARCHAR(255) NOT NULL UNIQUE,
    id_pedido BIGINT NOT NULL,
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    responsable BIGINT NOT NULL,
    observaciones VARCHAR(255) NULL,
    archivo_adjunto VARCHAR(255) NULL,
    estado VARCHAR(255) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'RECEPCIONADO')),
    CONSTRAINT fk_orden_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_orden_responsable FOREIGN KEY (responsable) REFERENCES users(id_user)
);

CREATE TABLE detalle_orden_impresion (
    id_orden_trabajo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_orden BIGINT NOT NULL,
    id_cotizacion_trabajo BIGINT NOT NULL,
    observaciones VARCHAR(255) NULL,
    CONSTRAINT fk_det_orden_impresion FOREIGN KEY (id_orden) REFERENCES orden_impresion(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_det_orden_cot_trabajo FOREIGN KEY (id_cotizacion_trabajo) REFERENCES cotizacion_trabajo(id_cotizacion_trabajo)
);

CREATE TABLE planificacion_semanal (
    id_planificacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    creado_por BIGINT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    observaciones VARCHAR(255) NULL,
    CONSTRAINT fk_plan_creador FOREIGN KEY (creado_por) REFERENCES users(id_user)
);

CREATE TABLE trabajo_programado (
    id_trabajo_programado BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_planificacion BIGINT NOT NULL,
    id_pedido BIGINT NULL,
    id_orden_impresion BIGINT NULL,
    cliente VARCHAR(255) NULL,
    descripcion_trabajo TEXT NOT NULL,
    area_trabajo VARCHAR(100) NULL,
    direccion TEXT NULL,
    id_trabajador_asignado BIGINT NULL,
    trabajador VARCHAR(255) NULL,
    fecha_programada DATE NOT NULL,
    hora_programada TIME NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'REPROGRAMADO')),
    cumplido BOOLEAN DEFAULT FALSE,
    observaciones VARCHAR(255) NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    ultima_modificacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_prog_planificacion FOREIGN KEY (id_planificacion) REFERENCES planificacion_semanal(id_planificacion) ON DELETE CASCADE,
    CONSTRAINT fk_prog_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_prog_orden FOREIGN KEY (id_orden_impresion) REFERENCES orden_impresion(id_orden),
    CONSTRAINT fk_prog_trabajador FOREIGN KEY (id_trabajador_asignado) REFERENCES employees(id_employee) ON DELETE SET NULL
);

CREATE TABLE reprogramacion_trabajo (
    id_reprogramacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_trabajo_programado BIGINT NOT NULL,
    fecha_original DATE NOT NULL,
    fecha_nueva DATE NOT NULL,
    motivo TEXT NULL,
    usuario_reprogramo BIGINT NULL,
    fecha_reprogramacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_reprog_trabajo FOREIGN KEY (id_trabajo_programado) REFERENCES trabajo_programado(id_trabajo_programado) ON DELETE CASCADE,
    CONSTRAINT fk_reprog_usuario FOREIGN KEY (usuario_reprogramo) REFERENCES users(id_user)
);

-- =========================================================================
-- 12. FACTURACIÓN
-- =========================================================================

CREATE TABLE facturacion (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    cuf VARCHAR(255) NULL,
    numero_factura_siat BIGINT NULL,
    fecha_emision_siat TIMESTAMPTZ NULL,
    leyenda VARCHAR(255) NULL,
    url_qr VARCHAR(255) NULL,
    estado VARCHAR(255) NOT NULL,
    json_enviado TEXT NULL,
    json_recibido TEXT NULL,
    mensajes_error TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_factura_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- =========================================================================
-- 13. SISTEMA DE PERMISOS Y ROLES
-- =========================================================================

CREATE TABLE permisos (
    id_permiso BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles_permisos (
    id_role BIGINT NOT NULL,
    id_permiso BIGINT NOT NULL,
    fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_role, id_permiso),
    CONSTRAINT fk_roles_permisos_role FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
    CONSTRAINT fk_roles_permisos_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE
);

-- =========================================================================
-- 14. SEMILLA DE DATOS (SEED): ROLES Y PERMISOS
-- =========================================================================

INSERT INTO roles (name_role, state) VALUES 
('OFICINA', TRUE),   -- ID 1: Administrativo, Comercial y Gestión
('TALLER', TRUE),    -- ID 2: Operativo, Producción y Logística
('Cliente', TRUE);   -- ID 3: Clientes registrados en el portal web público

INSERT INTO permisos (codigo, nombre, modulo, accion, estado) VALUES
-- Empleados
('EMPLEADO_VER', 'Ver empleados', 'EMPLEADO', 'VER', TRUE),
('EMPLEADO_CREAR', 'Crear empleados', 'EMPLEADO', 'CREAR', TRUE),
('EMPLEADO_EDITAR', 'Editar empleados', 'EMPLEADO', 'EDITAR', TRUE),
('EMPLEADO_ELIMINAR', 'Eliminar empleados', 'EMPLEADO', 'ELIMINAR', TRUE),

-- Clientes
('CLIENTE_VER', 'Ver clientes', 'CLIENTE', 'VER', TRUE),
('CLIENTE_CREAR', 'Crear clientes', 'CLIENTE', 'CREAR', TRUE),
('CLIENTE_EDITAR', 'Editar clientes', 'CLIENTE', 'EDITAR', TRUE),
('CLIENTE_ELIMINAR', 'Eliminar clientes', 'CLIENTE', 'ELIMINAR', TRUE),

-- Catálogo de Trabajos / Servicios
('TRABAJO_VER', 'Ver catálogo de trabajos', 'TRABAJO', 'VER', TRUE),
('TRABAJO_CREAR', 'Crear catálogo de trabajos', 'TRABAJO', 'CREAR', TRUE),
('TRABAJO_EDITAR', 'Editar catálogo de trabajos', 'TRABAJO', 'EDITAR', TRUE),
('TRABAJO_ELIMINAR', 'Eliminar catálogo de trabajos', 'TRABAJO', 'ELIMINAR', TRUE),

-- Solicitudes de Cotización
('SOLICITUD_COTIZACION_VER', 'Ver solicitudes', 'SOLICITUD_COTIZACION', 'VER', TRUE),
('SOLICITUD_COTIZACION_CREAR', 'Crear solicitudes', 'SOLICITUD_COTIZACION', 'CREAR', TRUE),
('SOLICITUD_COTIZACION_EDITAR', 'Editar solicitudes', 'SOLICITUD_COTIZACION', 'EDITAR', TRUE),
('SOLICITUD_COTIZACION_ELIMINAR', 'Eliminar solicitudes', 'SOLICITUD_COTIZACION', 'ELIMINAR', TRUE),

-- Cotizaciones
('COTIZACION_VER', 'Ver cotizaciones', 'COTIZACION', 'VER', TRUE),
('COTIZACION_CREAR', 'Crear cotizaciones', 'COTIZACION', 'CREAR', TRUE),
('COTIZACION_EDITAR', 'Editar cotizaciones', 'COTIZACION', 'EDITAR', TRUE),
('COTIZACION_APROBAR', 'Aprobar cotizaciones', 'COTIZACION', 'APROBAR', TRUE),

-- Pedidos
('PEDIDO_VER', 'Ver pedidos', 'PEDIDO', 'VER', TRUE),
('PEDIDO_CREAR', 'Crear pedidos', 'PEDIDO', 'CREAR', TRUE),
('PEDIDO_EDITAR', 'Editar pedidos', 'PEDIDO', 'EDITAR', TRUE),

-- Órdenes de Impresión
('ORDEN_IMPRESION_VER', 'Ver ordenes de impresion', 'ORDEN_IMPRESION', 'VER', TRUE),
('ORDEN_IMPRESION_CREAR', 'Crear ordenes de impresion', 'ORDEN_IMPRESION', 'CREAR', TRUE),
('ORDEN_IMPRESION_EDITAR', 'Editar ordenes de impresion', 'ORDEN_IMPRESION', 'EDITAR', TRUE),

-- Planificación / Planner
('PLANIFICACION_VER', 'Ver planificacion', 'PLANIFICACION', 'VER', TRUE),
('PLANIFICACION_CREAR', 'Crear planificacion', 'PLANIFICACION', 'CREAR', TRUE),
('PLANIFICACION_EDITAR', 'Editar planificacion', 'PLANIFICACION', 'EDITAR', TRUE),
('PLANIFICACION_ELIMINAR', 'Eliminar planificacion', 'PLANIFICACION', 'ELIMINAR', TRUE),

-- Herramientas y Préstamos de Taller
('HERRAMIENTA_VER', 'Ver herramientas', 'HERRAMIENTA', 'VER', TRUE),
('HERRAMIENTA_CREAR', 'Crear herramientas', 'HERRAMIENTA', 'CREAR', TRUE),
('HERRAMIENTA_EDITAR', 'Editar herramientas', 'HERRAMIENTA', 'EDITAR', TRUE),
('HERRAMIENTA_ELIMINAR', 'Eliminar herramientas', 'HERRAMIENTA', 'ELIMINAR', TRUE),

('PRESTAMO_VER', 'Ver prestamos de herramientas', 'PRESTAMO', 'VER', TRUE),
('PRESTAMO_CREAR', 'Crear prestamos de herramientas', 'PRESTAMO', 'CREAR', TRUE),
('PRESTAMO_EDITAR', 'Editar prestamos de herramientas', 'PRESTAMO', 'EDITAR', TRUE),
('PRESTAMO_ELIMINAR', 'Eliminar prestamos de herramientas', 'PRESTAMO', 'ELIMINAR', TRUE),

-- Dashboard, Sesiones y Seguridad
('DASHBOARD_VER', 'Ver dashboard operativo', 'DASHBOARD', 'VER', TRUE),
('SESION_VER', 'Ver registro de sesiones', 'SESION', 'VER', TRUE),
('ROLES_VER', 'Ver y gestionar roles', 'ROLES', 'VER', TRUE),
('USUARIO_VER', 'Ver y gestionar usuarios', 'USUARIO', 'VER', TRUE);

-- ROL 1: OFICINA (Control Total Administrativo, Comercial y Supervisión)
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT 1, id_permiso FROM permisos WHERE estado = TRUE;

-- ROL 2: TALLER (Operatividad de Impresión, Planner y Herramientas)
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT 2, id_permiso FROM permisos 
WHERE estado = TRUE 
  AND (
       modulo IN ('ORDEN_IMPRESION', 'PLANIFICACION', 'HERRAMIENTA', 'PRESTAMO', 'DASHBOARD')
       OR codigo = 'PEDIDO_VER'
  );

-- =========================================================================
-- 15. USUARIOS Y EMPLEADOS INICIALES (Password: 12345)
-- Hash BCrypt: $2a$10$Pa2KBiT7nfgX2JVtRJFFTOXT5ZFf725YhOwqsDot9lyEzBGn5SJ66
-- =========================================================================

-- Personas
INSERT INTO people (ci, name_people, ap, am, phone_number, addres) VALUES
('10686149', 'Fernando', 'Camata', 'Baspineiro', '65807763', 'Av. Las Americas 123'),
('04556733', 'Joaquin', 'Lopez', 'Perez', '78656578', 'Calle Luis de Fuentes 456');

-- Cuentas de Usuario (state_user = true)
INSERT INTO users (id_people, user_acces, password_acces, state_user, failed_login_attempts) VALUES
(1, 'oficina@urbansigns.com', '$2a$10$Pa2KBiT7nfgX2JVtRJFFTOXT5ZFf725YhOwqsDot9lyEzBGn5SJ66', TRUE, 0),
(2, 'taller@urbansigns.com', '$2a$10$Pa2KBiT7nfgX2JVtRJFFTOXT5ZFf725YhOwqsDot9lyEzBGn5SJ66', TRUE, 0);

-- Asignar Roles
INSERT INTO users_roles (id_role, id_user) VALUES
(1, 1),
(2, 2);

-- Crear Empleados (status = true)
INSERT INTO employees (id_people, status) VALUES
(1, TRUE),
(2, TRUE);

-- =========================================================================
-- 16. DATOS INICIALES DE PRUEBA (TRABAJOS Y HERRAMIENTAS)
-- =========================================================================

INSERT INTO trabajos (nombre, descripcion, foto, estado) VALUES
('Letrero Luminoso', 'Letreros con iluminacion LED de alta duracion', 'https://res.cloudinary.com/didpv0w7x/image/upload/v1764270359/trabajos/2025-11-27/77d359b4-7339-4dd0-9440-d4f48a617125.jpg', TRUE),
('Banner Publicitario', 'Banners impresos en alta resolucion para exteriores e interiores', 'https://res.cloudinary.com/didpv0w7x/image/upload/v1764270295/trabajos/2025-11-27/d90dea58-ee2b-49b3-942c-89892f222749.jpg', TRUE),
('Senalizacion Vial y Comercial', 'Senaletica preventiva e informativa en PVC y acrilico', 'https://res.cloudinary.com/didpv0w7x/image/upload/v1764270394/trabajos/2025-11-27/eb2ce22c-804b-45a8-84a3-55209afb65c1.jpg', TRUE);

INSERT INTO herramientas (codigo, nombre, marca, modelo, estado_actual, activo, observaciones) VALUES
('HERR-001', 'Taladro Percutor', 'Bosch', 'GSB 13 RE', 'DISPONIBLE', TRUE, 'Taladro percutor 650W para instalacion'),
('HERR-002', 'Amoladora Angular', 'DeWalt', 'DWE4010', 'DISPONIBLE', TRUE, 'Amoladora de 4-1/2 pulgadas 800W'),
('HERR-003', 'Pistola de Calor Industrial', 'Stanley', 'STXH2000', 'DISPONIBLE', TRUE, 'Pistola de calor para rotulacion y vinilo');
