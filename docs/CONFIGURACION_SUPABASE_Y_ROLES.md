# Guía de Configuración de Supabase, Roles y Alcance de Módulos — URBAN SIGNS

Este documento resume el diagnóstico sobre el acceso a los módulos ocultos, la arquitectura de permisos y las instrucciones para inicializar la base de datos en **Supabase** con los 2 usuarios operativos principales.

---

## 1. Diagnóstico: ¿Por qué se podía acceder a Compras, Proveedores e Inventarios?

Al revisar el historial de Git entre las ramas `main` y `backup/inventario-materiales-cotizacion`, se confirmó que:

* **No se mezcló una rama errónea.**
* **Los bloques visuales en el frontend siguen comentados** en [`Frontend-urban-signs/src/app/components/main-pages/main-pages.component.html`](file:///C:/sistemas_desarrollo/Sistemas-empresariales/URBAN_SIGNS/Frontend-urban-signs/src/app/components/main-pages/main-pages.component.html):
  - Líneas 109–141: Módulo Inventarios (Materiales, Stock, Categorías).
  - Líneas 160–166: Módulo Proveedores.
  - Líneas 168–174: Módulo Compras.

### Las causas reales por las que los usuarios accedían:

1. **Permisos en la Base de Datos restaurada (`supabase_ready_backup.sql`):**  
   El backup anterior contenía en la tabla `roles_permisos` asignaciones activas de `COMPRA_VER`, `PROVEEDOR_VER`, `MATERIAL_VER`, `LOTE_VER`, etc., para los roles `Gerente` y `Administrador`. Al iniciar sesión, Spring Boot entregaba estos permisos en el token JWT y en la sesión del usuario.
2. **Rutas abiertas en Angular (`main-pages-routing.module.ts`):**  
   Las rutas `/home/list-compras`, `/home/list-suppliers`, etc., no estaban desactivadas a nivel de router; dependen del `permissionGuard`. Como la base de datos decía que el usuario *sí tenía el permiso*, el guard autorizaba la navegación directa por URL.
3. **Módulo "Herramientas de trabajo" visible en el Sidebar:**  
   En la línea 144 de `main-pages.component.html`, el enlace a `list-inventory-materials` está activo porque se conservó para el flujo de **Préstamos de taller**. Con frecuencia este ítem se confunde con el inventario general de materias primas.
4. **Pantalla "Permisos por rol" (`/home/permisos-por-rol`):**  
   Al consultar la API, Angular recibe todos los permisos registrados en la tabla `permisos`. Al existir registros de Compras y Proveedores, el componente renderizaba las tarjetas para asignar permisos de dichos módulos.

---

## 2. Solución: Script Maestro Limpio para Supabase

Se generó el script SQL definitivo en la raíz del proyecto:
📄 [`supabase_clean_setup.sql`](file:///C:/sistemas_desarrollo/Sistemas-empresariales/URBAN_SIGNS/supabase_clean_setup.sql)

### Características del Script:
* **Compatibilidad 100% con Supabase:** Sin sentencias incompatibles de superusuario (`ALTER ... OWNER TO postgres;`).
* **Migraciones 2026 integradas:**
  - Soporte de `material` libre (especificación de texto sin requerir ID de inventario) en `solicitud_trabajo` y `cotizacion_trabajo`.
  - Campos de entrega física en `pedidos` (fecha real, entregador, foto evidencia, coordenadas GPS).
  - Préstamos de herramientas vinculados a pedidos (`id_pedido` en `prestamos_material_trabajo`).
  - Vinculación cliente-usuario del portal (`id_user` en `clientes`).
* **Módulos restringidos desactivados:** Los permisos de Compras, Proveedores, Lotes y Materiales de producción se crean con `estado = FALSE` y **no se asignan a ningún rol**, bloqueando el acceso en frontend y backend.

---

## 3. Usuarios Oficiales del Sistema

El script crea y configura los **2 usuarios principales** necesarios para la operación y defensa del proyecto:

| Usuario | Correo Electrónico | Contraseña | Rol Asignado | Alcance Permitido | Módulos Bloqueados |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrador / Gerente** | `administrador@gmail.com` | `12345` | `Gerente` (ID 1) | Acceso total al flujo operativo: Empleados, Usuarios, Roles, Clientes, Servicios, Solicitudes, Cotizaciones, Pedidos, Órdenes de Impresión, Planificación, Herramientas, Préstamos y Reportes. | 🚫 Compras, Proveedores, Stock, Lotes. |
| **Vendedor Comercial** | `vendedor@gmail.com` | `12345` | `Vendedor` (ID 2) | Flujo comercial: Clientes, Solicitudes de Cotización, Cotizaciones, Pedidos y Planificación / Seguimiento. | 🚫 Compras, Proveedores, Stock, Personal, Configuración. |

> **Nota sobre seguridad:** La contraseña `12345` utiliza el hash BCrypt oficial del sistema:  
> `$2a$10$Pa2KBiT7nfgX2JVtRJFFTOXT5ZFf725YhOwqsDot9lyEzBGn5SJ66`

---

## 4. Matriz de Permisos por Rol

### ✅ Módulos Activos (Dentro del Alcance)
* **EMPLEADO:** `EMPLEADO_VER`, `EMPLEADO_CREAR`, `EMPLEADO_EDITAR`, `EMPLEADO_ELIMINAR`
* **CLIENTE:** `CLIENTE_VER`, `CLIENTE_CREAR`, `CLIENTE_EDITAR`, `CLIENTE_ELIMINAR`
* **TRABAJO:** `TRABAJO_VER`, `TRABAJO_CREAR`, `TRABAJO_EDITAR`, `TRABAJO_ELIMINAR`
* **SOLICITUD_COTIZACION:** `SOLICITUD_COTIZACION_VER`, `SOLICITUD_COTIZACION_CREAR`, `SOLICITUD_COTIZACION_EDITAR`, `SOLICITUD_COTIZACION_ELIMINAR`
* **COTIZACION:** `COTIZACION_VER`, `COTIZACION_CREAR`, `COTIZACION_EDITAR`, `COTIZACION_APROBAR`
* **PEDIDO:** `PEDIDO_VER`, `PEDIDO_CREAR`, `PEDIDO_EDITAR`
* **ORDEN_IMPRESION:** `ORDEN_IMPRESION_VER`, `ORDEN_IMPRESION_CREAR`, `ORDEN_IMPRESION_EDITAR`
* **PLANIFICACION:** `PLANIFICACION_VER`, `PLANIFICACION_CREAR`, `PLANIFICACION_EDITAR`, `PLANIFICACION_ELIMINAR`
* **HERRAMIENTA:** `HERRAMIENTA_VER`, `HERRAMIENTA_CREAR`, `HERRAMIENTA_EDITAR`, `HERRAMIENTA_ELIMINAR`
* **PRESTAMO:** `PRESTAMO_VER`, `PRESTAMO_CREAR`, `PRESTAMO_EDITAR`, `PRESTAMO_ELIMINAR`
* **DASHBOARD:** `DASHBOARD_VER`
* **SESION:** `SESION_VER`

### 🚫 Módulos Desactivados (Fuera del Alcance)
* `COMPRA_*` (Ver, Crear, Editar)
* `PROVEEDOR_*` (Ver, Crear, Editar, Eliminar)
* `MATERIAL_*` (Ver, Crear, Editar, Eliminar — materias primas)
* `LOTE_*` (Ver)
* `CATEGORIA_*` (Ver)
* `RESIDUO_*` (Ver)

---

## 5. Instrucciones para Restaurar en Supabase

1. Iniciar sesión en la consola de **Supabase** y entrar al proyecto de URBAN SIGNS.
2. Ir a la sección **SQL Editor** en el menú izquierdo.
3. Abrir el archivo [`supabase_clean_setup.sql`](file:///C:/sistemas_desarrollo/Sistemas-empresariales/URBAN_SIGNS/supabase_clean_setup.sql).
4. Copiar todo el contenido del script, pegarlo en el SQL Editor y hacer clic en **Run**.
5. Reiniciar el backend de Spring Boot para limpiar cachés de sesión y cargar la conexión a la base limpia.
6. Probar el inicio de sesión en el frontend:
   - Gerente: `administrador@gmail.com` / `12345`
   - Vendedor: `vendedor@gmail.com` / `12345`
7. Verificar que al intentar ingresar por URL a `/home/list-compras` o `/home/list-suppliers`, el sistema rechace el acceso y redirija a `/home`.
