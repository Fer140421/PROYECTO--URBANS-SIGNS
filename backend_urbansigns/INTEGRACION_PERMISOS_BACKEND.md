# Integración de permisos y autorización en el backend

**Proyecto:** Urban Signs - Back-End  
**Estado:** Compras y cotizaciones configuradas; protección modular pendiente  
**Última actualización:** 13 de agosto de 2026  

## 1. Objetivo

El backend utiliza una autorización basada en:

```text
Usuario -> Roles -> Permisos
```

Los usuarios siguen teniendo uno o varios roles mediante `users_roles`. Cada rol puede tener varios permisos mediante `roles_permisos`. Los permisos representan acciones concretas del sistema, por ejemplo `COTIZACION_CREAR` o `COMPRA_VER`.

La autorización real se ejecuta en Spring Security. El frontend solo debe utilizar los permisos para mostrar u ocultar opciones de la interfaz; nunca debe ser la única barrera de seguridad.

## 2. Estado actual

### Completado

- Se creó la entidad JPA `PermisoModel` para la tabla `permisos`.
- Se agregó la relación `RolesModel -> permisos` usando la tabla `roles_permisos`.
- Se creó `PermisoRepository`.
- Se incluyeron los permisos activos de los roles como autoridades de Spring Security.
- Los roles continúan funcionando con el formato `ROLE_NOMBRE`.
- Los permisos se manejan sin prefijo, por ejemplo `COTIZACION_CREAR`.
- Los roles y permisos se incluyen en el JWT al iniciar sesión.
- El endpoint `/users/me` devuelve `roles` y `permissions`.
- Se agregaron endpoints administrativos para consultar y actualizar permisos de roles.
- Los endpoints administrativos de permisos y roles están restringidos a `Gerente`.
- Compras y cotizaciones ya tienen autorización por permisos.
- El proyecto compila correctamente con Maven.
- La aplicación reconoce las nuevas entidades y tablas al iniciar con PostgreSQL.

### Parcialmente completado

- `Gerente` tiene acceso alternativo en compras y cotizaciones mediante `hasRole('Gerente')`.
- La protección se aplicó solamente a compras y cotizaciones como primera fase.
- El resto de módulos continúa protegido únicamente por autenticación general mediante `anyRequest().authenticated()`.

### Pendiente

- Proteger el resto de módulos con permisos específicos.
- Revisar y asignar permisos a cada rol existente en PostgreSQL.
- Agregar pruebas de autorización para validar respuestas `401` y `403`.
- Definir la política de actualización de permisos cuando existen JWT activos.
- Integrar la administración de permisos en el frontend.
- Marcar el punto de autorización como completamente corregido en la auditoría cuando todos los módulos estén cubiertos.

## 3. Estructura de base de datos

Las tablas agregadas son:

```text
roles
users_roles
permisos
roles_permisos
```

Relaciones:

```text
users
  |
  +-- users_roles -- roles
                         |
                         +-- roles_permisos -- permisos
```

### Tabla `permisos`

Campos esperados:

| Campo | Tipo | Descripción |
|---|---|---|
| `id_permiso` | `SERIAL` | Identificador del permiso |
| `codigo` | `VARCHAR(80)` | Código usado por Spring Security |
| `nombre` | `VARCHAR(100)` | Nombre visible del permiso |
| `modulo` | `VARCHAR(50)` | Módulo al que pertenece |
| `accion` | `VARCHAR(50)` | Acción permitida |
| `estado` | `BOOLEAN` | Permiso activo o inactivo |

El campo `codigo` debe ser único. Algunos códigos utilizados por la primera integración son:

```text
CLIENTE_VER
CLIENTE_CREAR
CLIENTE_EDITAR
COTIZACION_VER
COTIZACION_CREAR
COTIZACION_EDITAR
COMPRA_VER
COMPRA_CREAR
COMPRA_EDITAR
```

### Tabla `roles_permisos`

Campos esperados:

| Campo | Tipo | Descripción |
|---|---|---|
| `id_role` | `INTEGER` | Referencia a `roles.id_role` |
| `id_permiso` | `INTEGER` | Referencia a `permisos.id_permiso` |
| `fecha_asignacion` | `TIMESTAMP` | Fecha de asignación, si fue creada |

La clave primaria recomendada es compuesta por `id_role` e `id_permiso`.

## 4. Cambios realizados en el código

### Modelo y persistencia

- `src/main/java/com/example/urban_signs/Model/PermisoModel.java`
  - Mapea la tabla `permisos`.
- `src/main/java/com/example/urban_signs/Model/RolesModel.java`
  - Mapea la relación `roles_permisos` mediante `@ManyToMany`.
- `src/main/java/com/example/urban_signs/Repository/PermisoRepository.java`
  - Consulta permisos activos ordenados por módulo y acción.

### Servicio y DTO

- `src/main/java/com/example/urban_signs/ServicesImpl/RolePermissionServiceImpl.java`
  - Lista permisos activos.
  - Reemplaza la asignación de permisos de un rol dentro de una transacción.
  - Valida que todos los IDs recibidos existan.
- `src/main/java/com/example/urban_signs/DTO/Permisos/RolePermissionsUpdateDTO.java`
  - Recibe la lista de IDs de permisos asignados a un rol.

### Seguridad y JWT

- `UserDetailServiceImpl`
  - Convierte los roles activos en autoridades `ROLE_*`.
  - Convierte los permisos activos en autoridades con su código exacto.
- `JwtUtils`
  - Guarda las autoridades en el claim `roles` por compatibilidad.
  - Guarda también los permisos en el claim `permissions`.
- `JwtAuthenticationFilter`
  - Devuelve `roles` y `permissions` en la respuesta del login.
- `JwtAuthorizationFilter`
  - Recupera las autoridades del JWT para que funcionen `hasRole` y `hasAuthority`.
- `UserController`
  - `/users/me` devuelve los roles y permisos actuales contenidos en la autenticación.

## 5. Endpoints de administración de permisos

Estos endpoints están protegidos con `hasRole('Gerente')`.

### Listar permisos

```http
GET /permisos
```

### Ver permisos de un rol

```http
GET /roles-permisos/rol/{roleId}
```

### Reemplazar permisos de un rol

```http
PUT /roles-permisos/rol/{roleId}
Content-Type: application/json
```

Cuerpo:

```json
{
  "permissionIds": [1, 2, 5]
}
```

La lista enviada reemplaza la asignación anterior del rol. Una lista vacía elimina todos los permisos del rol.

## 6. Módulos actualmente protegidos

### Compras

Controlador: `CompraController`

| Endpoint | Permiso |
|---|---|
| `POST /compras/crear` | `COMPRA_CREAR` |
| `GET /compras/listar` | `COMPRA_VER` |
| `PUT /compras/confirmar/{idCompra}` | `COMPRA_EDITAR` |
| `DELETE /compras/detalle/{id}` | `COMPRA_EDITAR` |
| `PUT /compras/cancelar/{id}` | `COMPRA_EDITAR` |
| `PUT /compras/modificar/{id}` | `COMPRA_EDITAR` |

### Cotizaciones

Controlador: `CotizacionController`

| Endpoint | Permiso |
|---|---|
| `POST /cotizaciones/registrar` | `COTIZACION_CREAR` |
| `PUT /cotizaciones/modificar-trabajos/{idCotizacion}` | `COTIZACION_EDITAR` |
| `GET /cotizaciones/confirmacion/{idSolicitud}` | `COTIZACION_VER` |
| `GET /cotizaciones/detalles-cotizacion/{id}` | `COTIZACION_VER` |
| `GET /cotizaciones/listar` | `COTIZACION_VER` |

Las expresiones actuales siguen este patrón:

```java
@PreAuthorize("hasRole('Gerente') or hasAuthority('COTIZACION_CREAR')")
```

Esto permite que `Gerente` conserve acceso global mientras los demás roles reciben permisos configurables.

## 7. Cobertura por módulo

Los módulos de esta tabla ya están protegidos por permisos específicos en cada
endpoint. La referencia completa de códigos y acciones está en
`MATRIZ_PERMISOS_BACKEND.md`. `UNIDAD_MEDIDA_ACCESO` se mantiene sin cambios.

| Módulo | Controlador | Permisos sugeridos |
|---|---|---|
| Clientes | `ClientesController` | `CLIENTE_VER`, `CLIENTE_CREAR`, `CLIENTE_EDITAR`, `CLIENTE_ELIMINAR` |
| Pedidos | `PedidosController` | `PEDIDO_VER`, `PEDIDO_CREAR`, `PEDIDO_EDITAR`, `PEDIDO_COMPLETAR` |
| Facturación | `FacturacionController` | `FACTURA_VER`, `FACTURA_EMITIR` |
| Usuarios | `UserController` | `USUARIO_VER`, `USUARIO_EDITAR`, `USUARIO_ADMINISTRAR` |
| Usuarios y roles | `Users_rolesController` | `USUARIO_ROL_VER`, `USUARIO_ROL_EDITAR` |
| Roles | `RolesController` | `ROL_VER`, `ROL_ADMINISTRAR` |
| Empleados | `EmployeeController` | `EMPLEADO_VER`, `EMPLEADO_CREAR`, `EMPLEADO_EDITAR` |
| Personas | `PeopleController` | `PERSONA_VER`, `PERSONA_CREAR`, `PERSONA_EDITAR`, `PERSONA_ELIMINAR` |
| Proveedores | `SupplierController` | `PROVEEDOR_VER`, `PROVEEDOR_CREAR`, `PROVEEDOR_EDITAR` |
| Solicitudes de cotización | `SolicitudCotizacionController` | `SOLICITUD_COTIZACION_VER`, `SOLICITUD_COTIZACION_CREAR`, `SOLICITUD_COTIZACION_EDITAR` |
| Inventario de materiales | `MaterialProduccionController` | `MATERIAL_VER`, `MATERIAL_CREAR`, `MATERIAL_EDITAR`, `MATERIAL_ELIMINAR` |
| Herramientas | `HerramientasController` | `HERRAMIENTA_VER`, `HERRAMIENTA_CREAR`, `HERRAMIENTA_EDITAR` |
| Lotes | `LotesController` | `LOTE_VER` |
| Residuos | `ResiduoMaterialController` | `RESIDUO_VER`, `RESIDUO_CREAR`, `RESIDUO_EDITAR`, `RESIDUO_ELIMINAR` |
| Préstamos | `PrestamoMaterialTrabajoController` | `PRESTAMO_VER`, `PRESTAMO_CREAR`, `PRESTAMO_EDITAR`, `PRESTAMO_DEVOLVER` |
| Detalles de préstamos | `DetallePrestamoController` | `PRESTAMO_DETALLE_VER`, `PRESTAMO_DETALLE_EDITAR` |
| Órdenes de impresión | `OrdenImpresionController` | `ORDEN_IMPRESION_VER`, `ORDEN_IMPRESION_CREAR`, `ORDEN_IMPRESION_EDITAR` |
| Planificación | `PlanificacionController` | `PLANIFICACION_VER`, `PLANIFICACION_CREAR`, `PLANIFICACION_EDITAR` |
| Trabajos | `TrabajosController` | `TRABAJO_VER`, `TRABAJO_CREAR`, `TRABAJO_EDITAR` |
| Categorías | `CategoryController` | `CATEGORIA_VER`, `CATEGORIA_CREAR`, `CATEGORIA_EDITAR` |
| Unidades de medida | `UnidadMedidaController` | `UNIDAD_MEDIDA_VER`, `UNIDAD_MEDIDA_CREAR`, `UNIDAD_MEDIDA_EDITAR` |
| Dashboard | `DashboardController` | `DASHBOARD_VER` |
| Sesiones | `SessionController` | `SESION_VER`, `SESION_DETALLE_VER` |
| WebSocket | `WebSocketController` | Revisar autorización específica de mensajes |

Los permisos se crean mediante `migrar_permisos_crud.sql`; las asignaciones de
cada rol siguen siendo configurables desde el endpoint administrativo.

## 8. Orden recomendado para continuar

### Fase 1: validar la primera integración

1. Confirmar que existen los permisos `COMPRA_*` y `COTIZACION_*` en PostgreSQL.
2. Asignarlos a los roles correspondientes en `roles_permisos`.
3. Cerrar sesión e iniciar sesión nuevamente.
4. Confirmar que el login devuelve `permissions`.
5. Probar un endpoint permitido y uno no permitido.

Resultados esperados:

```text
Sin JWT                       -> 401 Unauthorized
Con JWT sin permiso           -> 403 Forbidden
Con JWT con permiso           -> 200/201/204 según la operación
Con rol Gerente               -> acceso permitido por excepción global
```

### Fase 2: clientes y pedidos

Estos módulos deben revisarse antes que inventario porque participan directamente en los flujos comerciales. Crear los permisos en PostgreSQL, asignarlos a roles y proteger método por método.

### Fase 3: facturación y administración

Facturación y administración de usuarios/roles son módulos sensibles. Deben tener permisos separados y no depender solamente de `authenticated()`.

### Fase 4: inventario y producción

Proteger materiales, lotes, herramientas, residuos, préstamos, órdenes de impresión, trabajos y planificación.

### Fase 5: frontend

Cuando los módulos estén protegidos:

- Leer `permissions` desde la respuesta del login o `/users/me`.
- Crear una función central como `hasPermission('COTIZACION_CREAR')`.
- Ocultar botones y menús sin permiso.
- Mantener la validación en backend aunque el frontend oculte la opción.
- Crear una pantalla para asignar permisos a roles usando los endpoints administrativos.

## 9. Consideraciones importantes

### Renovación del JWT

Los roles y permisos se incluyen en el JWT al iniciar sesión. Si se modifica `roles_permisos`, los tokens existentes conservan la información anterior hasta que expiren o el usuario cierre sesión.

Por ahora, después de cambiar permisos se debe cerrar sesión e iniciar sesión nuevamente. Más adelante se puede mejorar con tokens de corta duración, invalidación de sesiones o consulta de permisos actuales en cada solicitud.

### Permisos versus reglas de negocio

Un permiso responde si el usuario puede ejecutar una acción:

```text
COTIZACION_CREAR
```

Una regla de negocio responde si la operación es válida en ese momento:

```text
La cotización está aprobada.
El pedido está pendiente.
El material tiene stock suficiente.
```

No se debe intentar resolver todas las reglas del negocio únicamente con permisos.

### Roles actuales

La relación `users_roles` se mantiene. No se debe reemplazar por permisos directos a usuarios salvo que exista una necesidad real de excepciones individuales. La estructura base continúa siendo:

```text
Usuario -> Roles -> Permisos
```

## 10. Archivos relevantes

- `src/main/java/com/example/urban_signs/Model/PermisoModel.java`
- `src/main/java/com/example/urban_signs/Model/RolesModel.java`
- `src/main/java/com/example/urban_signs/Repository/PermisoRepository.java`
- `src/main/java/com/example/urban_signs/ServicesImpl/RolePermissionServiceImpl.java`
- `src/main/java/com/example/urban_signs/DTO/Permisos/RolePermissionsUpdateDTO.java`
- `src/main/java/com/example/urban_signs/Controller/PermisoController.java`
- `src/main/java/com/example/urban_signs/Controller/RolePermissionController.java`
- `src/main/java/com/example/urban_signs/config/jwt/JwtUtils.java`
- `src/main/java/com/example/urban_signs/config/filters/JwtAuthenticationFilter.java`
- `src/main/java/com/example/urban_signs/config/filters/JwtAuthorizationFilter.java`
- `src/main/java/com/example/urban_signs/ServicesImpl/UserDetailServiceImpl.java`
- `src/main/java/com/example/urban_signs/Controller/CompraController.java`
- `src/main/java/com/example/urban_signs/Controller/CotizacionController.java`

## 11. Configuración inicial aplicada: Compras y Cotizaciones

La carga inicial está disponible en:

```text
src/main/resources/seed_permisos_roles_inicial.sql
```

El script crea o activa los permisos `COTIZACION_*` y `COMPRA_*`, y define esta base editable:

| Rol | Permisos iniciales |
|---|---|
| Gerente | Todos los permisos de Compras y Cotizaciones; acceso global por rol. |
| Administrador | Todos los permisos de Compras y Cotizaciones; configurables por Gerente. |
| Vendedor | `COTIZACION_VER`, `COTIZACION_CREAR`. |
| Diseñador | `COTIZACION_VER`. |
| Almacen | `COMPRA_VER`. |
| Cliente | Ninguno en estos dos módulos. |

`Gerente` es el único rol que puede consultar o reemplazar permisos de roles y asignar roles a usuarios. Las asignaciones son dinámicas: se actualizan en PostgreSQL mediante `roles_permisos`, sin cambios de código. Después de cualquier cambio, el usuario afectado debe cerrar sesión e iniciarla nuevamente para renovar el JWT.

Además de Compras y Cotizaciones, el backend ya protege por acción Categorías,
Clientes, Empleados, Facturación, Herramientas, Lotes, Materiales, Órdenes de
impresión, Pedidos, Personas, Planificación, Préstamos, Proveedores, Residuos,
Sesiones y Trabajos. Para una base de datos existente se debe ejecutar
`src/main/resources/migrar_permisos_crud.sql`.

## 12. Verificación realizada

- La compilación Maven terminó correctamente después de integrar permisos.
- Hibernate reconoció `PermisoModel` y el repositorio asociado.
- El backend registró los endpoints de permisos.
- La aplicación pudo conectar con PostgreSQL durante las pruebas anteriores.
- No se modificó la relación existente `users_roles`.

La implementación está completa en código y scripts. Aún se deben ejecutar la
migración SQL y las pruebas manuales `401/403` en cada ambiente antes del despliegue.
