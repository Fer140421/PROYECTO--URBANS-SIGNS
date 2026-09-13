# Ejecución de scripts de permisos

Los scripts de permisos se ejecutan manualmente en PostgreSQL. Antes de
ejecutarlos, realizar una copia de seguridad de la base de datos del ambiente
correspondiente.

## Base de datos nueva

Ejecutar los scripts exactamente en este orden:

1. `seed_permisos_roles_inicial.sql`
   - Crea los permisos iniciales de Compras y Cotizaciones y sus asignaciones
     base por rol.
2. `seed_permisos_modulos_restantes.sql`
   - Crea los permisos generales históricos para el resto de módulos y sus
     asignaciones base.
3. `migrar_permisos_crud.sql`
   - Crea el catálogo final de permisos por acción, migra las asignaciones de
     los permisos generales a sus equivalentes CRUD y desactiva los antiguos
     permisos `*_ACCESO`.

## Base de datos ya existente

Si la base de datos ya muestra los permisos generales como
`CATEGORIA_ACCESO`, `MATERIAL_ACCESO` o similares, ejecutar solamente:

1. `migrar_permisos_crud.sql`

El script es idempotente: puede ejecutarse nuevamente sin duplicar permisos ni
asignaciones. No elimina registros; conserva los permisos generales anteriores
en estado inactivo para mantener el historial.

## Después de ejecutar la migración

1. Iniciar sesión de nuevo con los usuarios de prueba para renovar el JWT.
2. Como Gerente, abrir **Personal > Permisos por rol**.
3. Confirmar que ya no aparecen los permisos antiguos `*_ACCESO`, excepto
   `UNIDAD_MEDIDA_ACCESO`, que se mantiene sin cambios.
4. Validar una operación permitida y otra no permitida para cada rol. Se espera
   `403 Forbidden` cuando el usuario no tenga el permiso requerido.

## No eliminar scripts anteriores

Los tres scripts son parte del historial de migración. No se deben eliminar:
los dos primeros permiten preparar una instalación desde cero y el tercero
actualiza bases que ya utilizaban permisos generales.
