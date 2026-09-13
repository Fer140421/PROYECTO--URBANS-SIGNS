-- Tercera fase: reemplaza los permisos generales *_ACCESO por permisos por accion.
-- Ejecutar DESPUES de seed_permisos_roles_inicial.sql y
-- seed_permisos_modulos_restantes.sql.
-- No elimina datos: conserva las asignaciones vigentes y las migra a los
-- permisos CRUD equivalentes. UNIDAD_MEDIDA_ACCESO no se modifica.
-- Guia completa: README_PERMISOS_SQL.md.

BEGIN;

INSERT INTO permisos (codigo, nombre, modulo, accion, estado)
VALUES
    ('CATEGORIA_VER', 'Ver categorias', 'CATEGORIA', 'VER', TRUE),
    ('CATEGORIA_CREAR', 'Crear categorias', 'CATEGORIA', 'CREAR', TRUE),
    ('CATEGORIA_EDITAR', 'Editar categorias', 'CATEGORIA', 'EDITAR', TRUE),
    ('CATEGORIA_ELIMINAR', 'Eliminar categorias', 'CATEGORIA', 'ELIMINAR', TRUE),
    ('CLIENTE_VER', 'Ver clientes', 'CLIENTE', 'VER', TRUE),
    ('CLIENTE_CREAR', 'Crear clientes', 'CLIENTE', 'CREAR', TRUE),
    ('CLIENTE_EDITAR', 'Editar clientes', 'CLIENTE', 'EDITAR', TRUE),
    ('CLIENTE_ELIMINAR', 'Eliminar clientes', 'CLIENTE', 'ELIMINAR', TRUE),
    ('EMPLEADO_VER', 'Ver empleados', 'EMPLEADO', 'VER', TRUE),
    ('EMPLEADO_CREAR', 'Crear empleados', 'EMPLEADO', 'CREAR', TRUE),
    ('EMPLEADO_EDITAR', 'Editar empleados', 'EMPLEADO', 'EDITAR', TRUE),
    ('EMPLEADO_ELIMINAR', 'Eliminar empleados', 'EMPLEADO', 'ELIMINAR', TRUE),
    ('FACTURACION_VER', 'Ver facturas', 'FACTURACION', 'VER', TRUE),
    ('FACTURACION_CREAR', 'Emitir facturas', 'FACTURACION', 'CREAR', TRUE),
    ('HERRAMIENTA_VER', 'Ver herramientas', 'HERRAMIENTA', 'VER', TRUE),
    ('HERRAMIENTA_CREAR', 'Crear herramientas', 'HERRAMIENTA', 'CREAR', TRUE),
    ('HERRAMIENTA_EDITAR', 'Editar herramientas', 'HERRAMIENTA', 'EDITAR', TRUE),
    ('HERRAMIENTA_ELIMINAR', 'Eliminar herramientas', 'HERRAMIENTA', 'ELIMINAR', TRUE),
    ('LOTE_VER', 'Ver lotes', 'LOTE', 'VER', TRUE),
    ('MATERIAL_VER', 'Ver materiales y stock', 'MATERIAL', 'VER', TRUE),
    ('MATERIAL_CREAR', 'Crear materiales', 'MATERIAL', 'CREAR', TRUE),
    ('MATERIAL_EDITAR', 'Editar materiales', 'MATERIAL', 'EDITAR', TRUE),
    ('MATERIAL_ELIMINAR', 'Eliminar materiales', 'MATERIAL', 'ELIMINAR', TRUE),
    ('ORDEN_IMPRESION_VER', 'Ver ordenes de impresion', 'ORDEN_IMPRESION', 'VER', TRUE),
    ('ORDEN_IMPRESION_CREAR', 'Crear ordenes de impresion', 'ORDEN_IMPRESION', 'CREAR', TRUE),
    ('ORDEN_IMPRESION_EDITAR', 'Editar ordenes de impresion', 'ORDEN_IMPRESION', 'EDITAR', TRUE),
    ('PEDIDO_VER', 'Ver pedidos', 'PEDIDO', 'VER', TRUE),
    ('PEDIDO_CREAR', 'Crear pedidos', 'PEDIDO', 'CREAR', TRUE),
    ('PEDIDO_EDITAR', 'Editar pedidos', 'PEDIDO', 'EDITAR', TRUE),
    ('PERSONA_VER', 'Ver personas', 'PERSONA', 'VER', TRUE),
    ('PERSONA_CREAR', 'Crear personas', 'PERSONA', 'CREAR', TRUE),
    ('PERSONA_EDITAR', 'Editar personas', 'PERSONA', 'EDITAR', TRUE),
    ('PERSONA_ELIMINAR', 'Eliminar personas', 'PERSONA', 'ELIMINAR', TRUE),
    ('PLANIFICACION_VER', 'Ver planificacion', 'PLANIFICACION', 'VER', TRUE),
    ('PLANIFICACION_CREAR', 'Crear planificacion', 'PLANIFICACION', 'CREAR', TRUE),
    ('PLANIFICACION_EDITAR', 'Editar planificacion', 'PLANIFICACION', 'EDITAR', TRUE),
    ('PLANIFICACION_ELIMINAR', 'Eliminar planificacion', 'PLANIFICACION', 'ELIMINAR', TRUE),
    ('PRESTAMO_VER', 'Ver prestamos', 'PRESTAMO', 'VER', TRUE),
    ('PRESTAMO_CREAR', 'Crear prestamos', 'PRESTAMO', 'CREAR', TRUE),
    ('PRESTAMO_EDITAR', 'Editar prestamos', 'PRESTAMO', 'EDITAR', TRUE),
    ('PRESTAMO_ELIMINAR', 'Eliminar prestamos', 'PRESTAMO', 'ELIMINAR', TRUE),
    ('PROVEEDOR_VER', 'Ver proveedores', 'PROVEEDOR', 'VER', TRUE),
    ('PROVEEDOR_CREAR', 'Crear proveedores', 'PROVEEDOR', 'CREAR', TRUE),
    ('PROVEEDOR_EDITAR', 'Editar proveedores', 'PROVEEDOR', 'EDITAR', TRUE),
    ('PROVEEDOR_ELIMINAR', 'Eliminar proveedores', 'PROVEEDOR', 'ELIMINAR', TRUE),
    ('RESIDUO_VER', 'Ver residuos', 'RESIDUO', 'VER', TRUE),
    ('RESIDUO_CREAR', 'Crear residuos', 'RESIDUO', 'CREAR', TRUE),
    ('RESIDUO_EDITAR', 'Editar residuos', 'RESIDUO', 'EDITAR', TRUE),
    ('RESIDUO_ELIMINAR', 'Eliminar residuos', 'RESIDUO', 'ELIMINAR', TRUE),
    ('SESION_VER', 'Ver sesiones', 'SESION', 'VER', TRUE),
    ('TRABAJO_VER', 'Ver trabajos', 'TRABAJO', 'VER', TRUE),
    ('TRABAJO_CREAR', 'Crear trabajos', 'TRABAJO', 'CREAR', TRUE),
    ('TRABAJO_EDITAR', 'Editar trabajos', 'TRABAJO', 'EDITAR', TRUE),
    ('TRABAJO_ELIMINAR', 'Eliminar trabajos', 'TRABAJO', 'ELIMINAR', TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    modulo = EXCLUDED.modulo,
    accion = EXCLUDED.accion,
    estado = TRUE;

-- Todo rol que tenia un permiso general recibe las acciones del mismo modulo.
WITH equivalencias(codigo_anterior, codigo_nuevo) AS (
    VALUES
        ('CATEGORIA_ACCESO', 'CATEGORIA_VER'), ('CATEGORIA_ACCESO', 'CATEGORIA_CREAR'), ('CATEGORIA_ACCESO', 'CATEGORIA_EDITAR'), ('CATEGORIA_ACCESO', 'CATEGORIA_ELIMINAR'),
        ('CLIENTE_ACCESO', 'CLIENTE_VER'), ('CLIENTE_ACCESO', 'CLIENTE_CREAR'), ('CLIENTE_ACCESO', 'CLIENTE_EDITAR'), ('CLIENTE_ACCESO', 'CLIENTE_ELIMINAR'),
        ('EMPLEADO_ACCESO', 'EMPLEADO_VER'), ('EMPLEADO_ACCESO', 'EMPLEADO_CREAR'), ('EMPLEADO_ACCESO', 'EMPLEADO_EDITAR'), ('EMPLEADO_ACCESO', 'EMPLEADO_ELIMINAR'),
        ('FACTURACION_ACCESO', 'FACTURACION_VER'), ('FACTURACION_ACCESO', 'FACTURACION_CREAR'),
        ('HERRAMIENTA_ACCESO', 'HERRAMIENTA_VER'), ('HERRAMIENTA_ACCESO', 'HERRAMIENTA_CREAR'), ('HERRAMIENTA_ACCESO', 'HERRAMIENTA_EDITAR'), ('HERRAMIENTA_ACCESO', 'HERRAMIENTA_ELIMINAR'),
        ('LOTE_ACCESO', 'LOTE_VER'),
        ('MATERIAL_ACCESO', 'MATERIAL_VER'), ('MATERIAL_ACCESO', 'MATERIAL_CREAR'), ('MATERIAL_ACCESO', 'MATERIAL_EDITAR'), ('MATERIAL_ACCESO', 'MATERIAL_ELIMINAR'),
        ('ORDEN_IMPRESION_ACCESO', 'ORDEN_IMPRESION_VER'), ('ORDEN_IMPRESION_ACCESO', 'ORDEN_IMPRESION_CREAR'), ('ORDEN_IMPRESION_ACCESO', 'ORDEN_IMPRESION_EDITAR'),
        ('PEDIDO_ACCESO', 'PEDIDO_VER'), ('PEDIDO_ACCESO', 'PEDIDO_CREAR'), ('PEDIDO_ACCESO', 'PEDIDO_EDITAR'),
        ('PERSONA_ACCESO', 'PERSONA_VER'), ('PERSONA_ACCESO', 'PERSONA_CREAR'), ('PERSONA_ACCESO', 'PERSONA_EDITAR'), ('PERSONA_ACCESO', 'PERSONA_ELIMINAR'),
        ('PLANIFICACION_ACCESO', 'PLANIFICACION_VER'), ('PLANIFICACION_ACCESO', 'PLANIFICACION_CREAR'), ('PLANIFICACION_ACCESO', 'PLANIFICACION_EDITAR'), ('PLANIFICACION_ACCESO', 'PLANIFICACION_ELIMINAR'),
        ('PRESTAMO_ACCESO', 'PRESTAMO_VER'), ('PRESTAMO_ACCESO', 'PRESTAMO_CREAR'), ('PRESTAMO_ACCESO', 'PRESTAMO_EDITAR'), ('PRESTAMO_ACCESO', 'PRESTAMO_ELIMINAR'),
        ('PROVEEDOR_ACCESO', 'PROVEEDOR_VER'), ('PROVEEDOR_ACCESO', 'PROVEEDOR_CREAR'), ('PROVEEDOR_ACCESO', 'PROVEEDOR_EDITAR'), ('PROVEEDOR_ACCESO', 'PROVEEDOR_ELIMINAR'),
        ('RESIDUO_ACCESO', 'RESIDUO_VER'), ('RESIDUO_ACCESO', 'RESIDUO_CREAR'), ('RESIDUO_ACCESO', 'RESIDUO_EDITAR'), ('RESIDUO_ACCESO', 'RESIDUO_ELIMINAR'),
        ('SESION_ACCESO', 'SESION_VER'),
        ('TRABAJO_ACCESO', 'TRABAJO_VER'), ('TRABAJO_ACCESO', 'TRABAJO_CREAR'), ('TRABAJO_ACCESO', 'TRABAJO_EDITAR'), ('TRABAJO_ACCESO', 'TRABAJO_ELIMINAR')
)
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT rp.id_role, permiso_nuevo.id_permiso
FROM roles_permisos rp
JOIN permisos permiso_anterior ON permiso_anterior.id_permiso = rp.id_permiso
JOIN equivalencias e ON e.codigo_anterior = permiso_anterior.codigo
JOIN permisos permiso_nuevo ON permiso_nuevo.codigo = e.codigo_nuevo
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Gerente y Administrador reciben el catalogo CRUD completo (excepto Unidad de medida).
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM roles r
CROSS JOIN permisos p
WHERE btrim(r.name_role, E' \t\n\r') IN ('Gerente', 'Administrador')
  AND p.codigo IN (
      'CATEGORIA_VER', 'CATEGORIA_CREAR', 'CATEGORIA_EDITAR', 'CATEGORIA_ELIMINAR',
      'CLIENTE_VER', 'CLIENTE_CREAR', 'CLIENTE_EDITAR', 'CLIENTE_ELIMINAR',
      'EMPLEADO_VER', 'EMPLEADO_CREAR', 'EMPLEADO_EDITAR', 'EMPLEADO_ELIMINAR',
      'FACTURACION_VER', 'FACTURACION_CREAR',
      'HERRAMIENTA_VER', 'HERRAMIENTA_CREAR', 'HERRAMIENTA_EDITAR', 'HERRAMIENTA_ELIMINAR',
      'LOTE_VER', 'MATERIAL_VER', 'MATERIAL_CREAR', 'MATERIAL_EDITAR', 'MATERIAL_ELIMINAR',
      'ORDEN_IMPRESION_VER', 'ORDEN_IMPRESION_CREAR', 'ORDEN_IMPRESION_EDITAR',
      'PEDIDO_VER', 'PEDIDO_CREAR', 'PEDIDO_EDITAR',
      'PERSONA_VER', 'PERSONA_CREAR', 'PERSONA_EDITAR', 'PERSONA_ELIMINAR',
      'PLANIFICACION_VER', 'PLANIFICACION_CREAR', 'PLANIFICACION_EDITAR', 'PLANIFICACION_ELIMINAR',
      'PRESTAMO_VER', 'PRESTAMO_CREAR', 'PRESTAMO_EDITAR', 'PRESTAMO_ELIMINAR',
      'PROVEEDOR_VER', 'PROVEEDOR_CREAR', 'PROVEEDOR_EDITAR', 'PROVEEDOR_ELIMINAR',
      'RESIDUO_VER', 'RESIDUO_CREAR', 'RESIDUO_EDITAR', 'RESIDUO_ELIMINAR',
      'SESION_VER', 'TRABAJO_VER', 'TRABAJO_CREAR', 'TRABAJO_EDITAR', 'TRABAJO_ELIMINAR'
  )
ON CONFLICT (id_role, id_permiso) DO NOTHING;

-- Los permisos generales ya no se usan por los controladores ni se listan en el frontend.
-- Se conservan inactivos para no perder el historial de asignaciones.
UPDATE permisos
SET estado = FALSE
WHERE codigo IN (
    'CATEGORIA_ACCESO', 'CLIENTE_ACCESO', 'EMPLEADO_ACCESO', 'FACTURACION_ACCESO',
    'HERRAMIENTA_ACCESO', 'LOTE_ACCESO', 'MATERIAL_ACCESO', 'ORDEN_IMPRESION_ACCESO',
    'PEDIDO_ACCESO', 'PERSONA_ACCESO', 'PLANIFICACION_ACCESO', 'PRESTAMO_ACCESO',
    'PROVEEDOR_ACCESO', 'RESIDUO_ACCESO', 'SESION_ACCESO', 'TRABAJO_ACCESO'
);

COMMIT;
