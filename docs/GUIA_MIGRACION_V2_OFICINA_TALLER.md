# Guía de Migración y Despliegue: Core Limpio (Oficina y Taller)

Esta guía detalla los pasos para poner en marcha la nueva versión optimizada del sistema **Urban Signs**, desarrollada en la rama:
`refactor/core-oficina-taller`

---

## 1. Resumen de Cambios y Arquitectura

### ❌ Módulos Eliminados Permanentemente
Se eliminó todo el código huérfano y las dependencias de base de datos de los módulos que ya no se usan:
- **Compras** (órdenes de compra, facturas de compra).
- **Proveedores** (gestión de suplidores externos de materia prima).
- **Categorías** (categorías de insumos/materiales).
- **Inventario de Materia Prima** (lotes, stock físico de materia prima, mermas/residuos, movimientos de stock, detalle de cotización por desglose de materia prima).

### ✅ Módulos Activos Conservados
El sistema mantiene el flujo productivo y comercial real:
1. **Comercial / Clientes**: Clientes (Persona / Empresa), Catálogo de Trabajos / Servicios, Solicitudes de Cotización, Cotizaciones Formales, Pedidos y Pagos / Anticipos.
2. **Operaciones / Taller**: Órdenes de Impresión, Planificación Semanal (Planner visual interactivo por estados y reprogramación), Catálogo de Herramientas de Taller y Préstamos de Herramientas a Operarios.
3. **Administración / Seguridad**: Usuarios, Empleados, Roles, Permisos por Rol, Historial de Sesiones y Auditoría, Dashboard Estadístico.
4. **Portal Web de Clientes**: Registro público de clientes, autoservicio de cotizaciones y seguimiento de pedidos.

---

## 2. Nuevo Esquema de Roles

Se simplificó la estructura de roles del personal interno a **2 roles operativos**:

| Rol | Tipo | Acceso y Responsabilidades |
| :--- | :--- | :--- |
| **OFICINA** | Administrativo / Comercial | Acceso a gestión de clientes, cotizaciones, pedidos, pagos, facturación, reportes, usuarios, empleados, roles y supervisión de planificación y taller. |
| **TALLER** | Operativo / Producción | Acceso a órdenes de impresión, planner semanal, catálogo de herramientas y control de préstamos de herramientas. |
| **Cliente** | Portal Web | Rol asignado automáticamente al autorregistrarse en la landing page para consultar cotizaciones y pedidos propios. |

---

## 3. Cuentas de Acceso Iniciales (Seed Data)

Ambas cuentas están preconfiguradas y listas para usar con la base de datos limpia:

| Usuario | Contraseña | Rol Asignado | Nombre de Empleado |
| :--- | :--- | :--- | :--- |
| `oficina@urbansigns.com` | `12345` | **OFICINA** | Fernando Camata Baspineiro |
| `taller@urbansigns.com` | `12345` | **TALLER** | Joaquin Lopez Perez |

---

## 4. Pasos para la Puesta en Marcha

### Paso 1: Configurar la Base de Datos en Supabase
1. Ingresa a tu proyecto en [Supabase](https://supabase.com).
2. Ve a la sección **SQL Editor**.
3. Abre o copia el contenido completo del archivo:
   [`supabase_clean_core_v2.sql`](file:///C:/sistemas_desarrollo/Sistemas-empresariales/URBAN_SIGNS/supabase_clean_core_v2.sql)
4. Ejecuta el script (**Run**).
   > **Nota:** El script ejecuta un `DROP TABLE IF EXISTS ... CASCADE` controlado para limpiar tablas anteriores y reconstruye la estructura limpia con todas las tablas activas, llaves foráneas y los datos iniciales de roles, permisos, usuarios y herramientas.

### Paso 2: Iniciar el Backend (Spring Boot)
1. Abre una terminal en el directorio `backend_urbansigns`:
   ```powershell
   cd C:\sistemas_desarrollo\Sistemas-empresariales\URBAN_SIGNS\backend_urbansigns
   ```
2. Asegúrate de que las credenciales de conexión en tu archivo `.env` o `application.properties` apunten a tu base de datos de Supabase.
3. Inicia la aplicación:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
4. El servidor se iniciará en el puerto configurado (habitualmente `8080`).

### Paso 3: Iniciar el Frontend (Angular)
1. Abre otra terminal en el directorio `Frontend-urban-signs`:
   ```powershell
   cd C:\sistemas_desarrollo\Sistemas-empresariales\URBAN_SIGNS\Frontend-urban-signs
   ```
2. Inicia el servidor de desarrollo:
   ```powershell
   npm start
   ```
3. Ingresa desde el navegador a `http://localhost:4200`.

---

## 5. Pruebas de Verificación Recomendadas

1. **Ingreso con Rol OFICINA**:
   - Inicia sesión con `oficina@urbansigns.com` / `12345`.
   - Verifica que el menú lateral muestre las opciones de Clientes, Cotizaciones, Pedidos, Personal (Usuarios, Roles, Permisos) y Herramientas.
2. **Ingreso con Rol TALLER**:
   - Cierra sesión e inicia sesión con `taller@urbansigns.com` / `12345`.
   - Verifica que el menú oculte las opciones administrativas y muestre Órdenes de Impresión, Planificación Semanal y Préstamos de Herramientas.
3. **Portal de Clientes (Opcional)**:
   - En `LANDING_PAGE_URBAN_SIGNS`, verifica que el registro y acceso a `/portal` funcione normalmente con el rol `Cliente`.
