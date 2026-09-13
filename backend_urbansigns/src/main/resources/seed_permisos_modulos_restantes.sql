-- Segunda fase: permisos para todos los modulos protegidos por el backend.
-- Ejecutar despues de seed_permisos_roles_inicial.sql.
-- No borra asignaciones existentes; puede ejecutarse mas de una vez.

BEGIN;

INSERT INTO permisos (codigo, nombre, modulo, accion, estado)
VALUES
    ('CATEGORIA_ACCESO', 'Gestionar categorias', 'CATEGORIA', 'ACCESO', TRUE),
    ('CLIENTE_ACCESO', 'Gestionar clientes', 'CLIENTE', 'ACCESO', TRUE),
    ('DASHBOARD_VER', 'Ver dashboard', 'DASHBOARD', 'VER', TRUE),
    ('PRESTAMO_ACCESO', 'Gestionar prestamos', 'PRESTAMO', 'ACCESO', TRUE),
    ('EMPLEADO_ACCESO', 'Gestionar empleados', 'EMPLEADO', 'ACCESO', TRUE),
    ('FACTURACION_ACCESO', 'Gestionar facturacion', 'FACTURACION', 'ACCESO', TRUE),
    ('HERRAMIENTA_ACCESO', 'Gestionar herramientas', 'HERRAMIENTA', 'ACCESO', TRUE),
    ('LOTE_ACCESO', 'Gestionar lotes', 'LOTE', 'ACCESO', TRUE),
    ('MATERIAL_ACCESO', 'Gestionar materiales y stock', 'MATERIAL', 'ACCESO', TRUE),
    ('ORDEN_IMPRESION_ACCESO', 'Gestionar ordenes de impresion', 'ORDEN_IMPRESION', 'ACCESO', TRUE),
    ('PEDIDO_ACCESO', 'Gestionar pedidos', 'PEDIDO', 'ACCESO', TRUE),
    ('PERSONA_ACCESO', 'Gestionar personas', 'PERSONA', 'ACCESO', TRUE),
    ('PLANIFICACION_ACCESO', 'Gestionar planificacion', 'PLANIFICACION', 'ACCESO', TRUE),
    ('RESIDUO_ACCESO', 'Gestionar residuos', 'RESIDUO', 'ACCESO', TRUE),
    ('SESION_ACCESO', 'Ver sesiones', 'SESION', 'ACCESO', TRUE),
    ('PROVEEDOR_ACCESO', 'Gestionar proveedores', 'PROVEEDOR', 'ACCESO', TRUE),
    ('TRABAJO_ACCESO', 'Gestionar trabajos', 'TRABAJO', 'ACCESO', TRUE),
    ('UNIDAD_MEDIDA_ACCESO', 'Gestionar unidades de medida', 'UNIDAD_MEDIDA', 'ACCESO', TRUE),
    ('SOLICITUD_COTIZACION_VER', 'Ver solicitudes de cotizacion', 'SOLICITUD_COTIZACION', 'VER', TRUE),
    ('SOLICITUD_COTIZACION_CREAR', 'Crear solicitudes de cotizacion', 'SOLICITUD_COTIZACION', 'CREAR', TRUE),
    ('SOLICITUD_COTIZACION_EDITAR', 'Editar solicitudes de cotizacion', 'SOLICITUD_COTIZACION', 'EDITAR', TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    modulo = EXCLUDED.modulo,
    accion = EXCLUDED.accion,
    estado = TRUE;

-- Gerente y Administrador reciben el catalogo operativo completo.
-- Gerente conserva ademas acceso global por rol y administra roles/permisos.
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
JOIN permisos p ON p.codigo IN (
    'CATEGORIA_ACCESO', 'CLIENTE_ACCESO', 'DASHBOARD_VER', 'PRESTAMO_ACCESO',
    'EMPLEADO_ACCESO', 'FACTURACION_ACCESO', 'HERRAMIENTA_ACCESO', 'LOTE_ACCESO',
    'MATERIAL_ACCESO', 'ORDEN_IMPRESION_ACCESO', 'PEDIDO_ACCESO', 'PERSONA_ACCESO',
    'PLANIFICACION_ACCESO', 'RESIDUO_ACCESO', 'SESION_ACCESO', 'PROVEEDOR_ACCESO',
    'TRABAJO_ACCESO', 'UNIDAD_MEDIDA_ACCESO', 'SOLICITUD_COTIZACION_VER',
    'SOLICITUD_COTIZACION_CREAR', 'SOLICITUD_COTIZACION_EDITAR'
)
WHERE btrim(r.name_role, E' \t\n\r') IN ('Gerente', 'Administrador')
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Vendedor: comercial, cotizaciones/pedidos y solicitudes. Los permisos de
-- cotizacion existentes se conservan desde la carga inicial.
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
JOIN permisos p ON p.codigo IN (
    'DASHBOARD_VER', 'PEDIDO_ACCESO', 'SOLICITUD_COTIZACION_VER',
    'SOLICITUD_COTIZACION_CREAR', 'SOLICITUD_COTIZACION_EDITAR'
)
WHERE btrim(r.name_role, E' \t\n\r') = 'Vendedor'
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Diseñador: produccion, planificacion y ordenes de impresion.
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
JOIN permisos p ON p.codigo IN (
    'DASHBOARD_VER', 'MATERIAL_ACCESO', 'ORDEN_IMPRESION_ACCESO',
    'PLANIFICACION_ACCESO', 'TRABAJO_ACCESO'
)
WHERE btrim(r.name_role, E' \t\n\r') = 'Diseñador'
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Almacen: inventario, proveedores, compras, prestamos y residuos.
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
JOIN permisos p ON p.codigo IN (
    'DASHBOARD_VER', 'HERRAMIENTA_ACCESO', 'LOTE_ACCESO', 'MATERIAL_ACCESO',
    'PRESTAMO_ACCESO', 'PROVEEDOR_ACCESO', 'RESIDUO_ACCESO'
)
WHERE btrim(r.name_role, E' \t\n\r') = 'Almacen'
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Cliente: solo registra solicitudes; no recibe permiso para listar o editar datos internos.
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
JOIN permisos p ON p.codigo = 'SOLICITUD_COTIZACION_CREAR'
WHERE btrim(r.name_role, E' \t\n\r') = 'Cliente'
ON CONFLICT (id_role, id_permiso) DO NOTHING;

COMMIT;
