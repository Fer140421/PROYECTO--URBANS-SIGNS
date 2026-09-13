# Matriz de permisos del backend

## Regla global

- `Gerente` tiene acceso global y es el único rol que administra usuarios, roles y permisos.
- Todos los demás accesos dependen de permisos en `roles_permisos`.
- Después de cambiar una asignación, el usuario afectado debe iniciar sesión nuevamente para renovar su JWT.

## Cobertura aplicada

| Módulo | Permiso |
|---|---|
| Categorías | `CATEGORIA_VER`, `CATEGORIA_CREAR`, `CATEGORIA_EDITAR`, `CATEGORIA_ELIMINAR` |
| Clientes | `CLIENTE_VER`, `CLIENTE_CREAR`, `CLIENTE_EDITAR`, `CLIENTE_ELIMINAR` |
| Dashboard | `DASHBOARD_VER` |
| Préstamos y detalle de préstamos | `PRESTAMO_VER`, `PRESTAMO_CREAR`, `PRESTAMO_EDITAR`, `PRESTAMO_ELIMINAR` |
| Empleados | `EMPLEADO_VER`, `EMPLEADO_CREAR`, `EMPLEADO_EDITAR`, `EMPLEADO_ELIMINAR` |
| Facturación | `FACTURACION_VER`, `FACTURACION_CREAR` |
| Herramientas | `HERRAMIENTA_VER`, `HERRAMIENTA_CREAR`, `HERRAMIENTA_EDITAR`, `HERRAMIENTA_ELIMINAR` |
| Lotes | `LOTE_VER` |
| Materiales y stock | `MATERIAL_VER`, `MATERIAL_CREAR`, `MATERIAL_EDITAR`, `MATERIAL_ELIMINAR` |
| Órdenes de impresión | `ORDEN_IMPRESION_VER`, `ORDEN_IMPRESION_CREAR`, `ORDEN_IMPRESION_EDITAR` |
| Pedidos | `PEDIDO_VER`, `PEDIDO_CREAR`, `PEDIDO_EDITAR` |
| Personas | `PERSONA_VER`, `PERSONA_CREAR`, `PERSONA_EDITAR`, `PERSONA_ELIMINAR` |
| Planificación | `PLANIFICACION_VER`, `PLANIFICACION_CREAR`, `PLANIFICACION_EDITAR`, `PLANIFICACION_ELIMINAR` |
| Residuos | `RESIDUO_VER`, `RESIDUO_CREAR`, `RESIDUO_EDITAR`, `RESIDUO_ELIMINAR` |
| Sesiones | `SESION_VER` |
| Proveedores | `PROVEEDOR_VER`, `PROVEEDOR_CREAR`, `PROVEEDOR_EDITAR`, `PROVEEDOR_ELIMINAR` |
| Trabajos | `TRABAJO_VER`, `TRABAJO_CREAR`, `TRABAJO_EDITAR`, `TRABAJO_ELIMINAR` |
| Unidades de medida | `UNIDAD_MEDIDA_ACCESO` |
| Solicitudes de cotización | `SOLICITUD_COTIZACION_VER`, `SOLICITUD_COTIZACION_CREAR`, `SOLICITUD_COTIZACION_EDITAR` |
| Cotizaciones | `COTIZACION_VER`, `COTIZACION_CREAR`, `COTIZACION_EDITAR` |
| Compras | `COMPRA_VER`, `COMPRA_CREAR`, `COMPRA_EDITAR` |

## Asignación inicial

La configuración base está en `src/main/resources/seed_permisos_modulos_restantes.sql`.
Para instalaciones que ya tienen los permisos generales, ejecutar además
`src/main/resources/migrar_permisos_crud.sql`. Este script crea los permisos por
acción, migra las asignaciones existentes y desactiva los antiguos `*_ACCESO`.
El orden completo para instalaciones nuevas y la ruta para bases existentes se
documentan en `src/main/resources/README_PERMISOS_SQL.md`.

- Administrador: catálogo operativo completo, editable por Gerente.
- Vendedor: dashboard, pedidos y solicitudes; conserva sus permisos de cotización.
- Diseñador: dashboard, materiales, órdenes de impresión, planificación y trabajos.
- Almacen: dashboard, herramientas, lotes, materiales, préstamos, proveedores y residuos; conserva sus permisos de compra.
- Cliente: solo `SOLICITUD_COTIZACION_CREAR`.

Los permisos se protegen por acción real del endpoint. Los módulos sin operaciones
de crear, editar o eliminar solo exponen los permisos que aplican: Dashboard y
Sesiones tienen solo `VER`; Lotes solo tiene `VER`; Facturación tiene `VER` y
`CREAR`; y Órdenes de impresión/Pedidos no tienen `ELIMINAR` porque no exponen
esa operación. `UNIDAD_MEDIDA_ACCESO` se mantiene sin cambios por decisión del proyecto.
