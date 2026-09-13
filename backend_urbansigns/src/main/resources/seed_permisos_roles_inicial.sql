-- Configuracion inicial de permisos para los modulos que ya estan protegidos.
-- Ejecutar manualmente en PostgreSQL una sola vez.
-- Las asignaciones posteriores se administran dinamicamente desde roles_permisos.

BEGIN;

DO $$
BEGIN
    IF (
        SELECT COUNT(DISTINCT btrim(name_role, E' \t\n\r'))
        FROM roles
        WHERE btrim(name_role, E' \t\n\r') IN
            ('Gerente', 'Administrador', 'Vendedor', 'Diseñador', 'Almacen', 'Cliente')
    ) <> 6 THEN
        RAISE EXCEPTION 'Faltan uno o mas roles requeridos para la carga inicial de permisos';
    END IF;
END $$;

INSERT INTO permisos (codigo, nombre, modulo, accion, estado)
VALUES
    ('COTIZACION_VER', 'Ver cotizaciones', 'COTIZACION', 'VER', TRUE),
    ('COTIZACION_CREAR', 'Crear cotizaciones', 'COTIZACION', 'CREAR', TRUE),
    ('COTIZACION_EDITAR', 'Editar cotizaciones', 'COTIZACION', 'EDITAR', TRUE),
    ('COMPRA_VER', 'Ver compras', 'COMPRA', 'VER', TRUE),
    ('COMPRA_CREAR', 'Crear compras', 'COMPRA', 'CREAR', TRUE),
    ('COMPRA_EDITAR', 'Editar compras', 'COMPRA', 'EDITAR', TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    modulo = EXCLUDED.modulo,
    accion = EXCLUDED.accion,
    estado = TRUE;

-- Reemplaza solamente la configuracion inicial de Compras y Cotizaciones.
-- No modifica permisos de otros modulos que puedan agregarse posteriormente.
DELETE FROM roles_permisos rp
USING roles r, permisos p
WHERE rp.id_role = r.id_role
  AND rp.id_permiso = p.id_permiso
  AND btrim(r.name_role, E' \t\n\r') IN
      ('Gerente', 'Administrador', 'Vendedor', 'Diseñador', 'Almacen', 'Cliente')
  AND p.codigo IN
      ('COTIZACION_VER', 'COTIZACION_CREAR', 'COTIZACION_EDITAR',
       'COMPRA_VER', 'COMPRA_CREAR', 'COMPRA_EDITAR');

WITH asignaciones(nombre_rol, codigo_permiso) AS (
    VALUES
        -- Gerente: acceso completo a los modulos actuales y visibilidad completa en el frontend.
        ('Gerente', 'COTIZACION_VER'),
        ('Gerente', 'COTIZACION_CREAR'),
        ('Gerente', 'COTIZACION_EDITAR'),
        ('Gerente', 'COMPRA_VER'),
        ('Gerente', 'COMPRA_CREAR'),
        ('Gerente', 'COMPRA_EDITAR'),

        -- Administrador: apoyo operativo; sus permisos siguen siendo editables por Gerente.
        ('Administrador', 'COTIZACION_VER'),
        ('Administrador', 'COTIZACION_CREAR'),
        ('Administrador', 'COTIZACION_EDITAR'),
        ('Administrador', 'COMPRA_VER'),
        ('Administrador', 'COMPRA_CREAR'),
        ('Administrador', 'COMPRA_EDITAR'),

        -- Vendedor: prepara y consulta cotizaciones, sin modificar cotizaciones ya emitidas.
        ('Vendedor', 'COTIZACION_VER'),
        ('Vendedor', 'COTIZACION_CREAR'),

        -- Disenador: consulta cotizaciones para preparar trabajos.
        ('Diseñador', 'COTIZACION_VER'),

        -- Almacen: consulta compras para recepcion y control de materiales.
        ('Almacen', 'COMPRA_VER')
)
INSERT INTO roles_permisos (id_role, id_permiso)
SELECT r.id_role, p.id_permiso
FROM asignaciones a
JOIN roles r ON btrim(r.name_role, E' \t\n\r') = a.nombre_rol
JOIN permisos p ON p.codigo = a.codigo_permiso
ON CONFLICT (id_role, id_permiso) DO NOTHING;

COMMIT;
