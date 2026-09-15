# Cambios de la sesión — 20 de agosto de 2026

## Login: bloqueo temporal

Se actualizó `LoginComponent` para manejar el bloqueo temporal enviado por el backend en `POST /v1/user/login`.

- Detecta HTTP `423 Locked`.
- Lee `error.error.message`, `error.error.lockedUntil` y prioriza `error.error.retryAfterSeconds` para el contador.
- Usa el header `Retry-After` como respaldo si no llega `retryAfterSeconds` en el body.
- Muestra una cuenta regresiva en formato `mm:ss`.
- Deshabilita los controles del formulario y el botón mientras la cuenta está bloqueada.
- Restablece visualmente el bloqueo desde `sessionStorage` tras recargar la página.
- Al vencer el contador o tras un login exitoso, habilita nuevamente el formulario y elimina el bloqueo guardado.
- El intervalo se limpia al destruir el componente.

Archivos relacionados:

- `src/app/components/auth/login/login.component.ts`
- `src/app/components/auth/login/login.component.html`

> Para que se muestre el contador, el backend debe responder realmente con HTTP `423`, no con `401` o `403`. El body esperado incluye `message`, `lockedUntil` y `retryAfterSeconds`.

## Permisos dinámicos

Se reemplazó el uso de roles para decidir accesos funcionales por permisos entregados por el backend. Los roles se reservan para controles administrativos.

### Estado de autenticación

`LoginService` conserva por separado dentro del estado de usuario:

- `username`
- `roles`
- `permissions`

También:

- Restaura la sesión desde `localStorage` y, como respaldo, desde `sessionStorage`.
- Respuestas antiguas sin `permissions` se manejan con una lista vacía.
- Al cerrar o limpiar sesión, elimina los datos guardados de ambos almacenamientos.
- Se añadieron los métodos centralizados:
  - `hasPermission(permission)`
  - `hasAnyPermission(...permissions)`
  - `hasRole(role)`; acepta `Gerente` y `ROLE_Gerente`.

Archivo:

- `src/app/core/services/login/login.service.ts`

### Directiva y guard

Se crearon:

- `src/app/shared/directives/has-permission.directive.ts`
  - Permite ocultar elementos con `*hasPermission="'PERMISO'"` o con una lista de permisos.
- `src/app/core/guards/permission.guard.ts`
  - Lee `permissions` y/o `roles` desde `route.data`.
  - Si no se cumple el acceso, redirige a `/home`.

### Menú, rutas y acciones protegidas

- El menú principal usa permisos para cotizaciones, solicitudes, compras, inventarios, pedidos, clientes, proveedores, trabajos, planificación, préstamos, órdenes de impresión y dashboard.
- Administración de usuarios, roles y accesos permanece limitada a `ROLE_Gerente`.
- Las rutas principales de módulos usan `permissionGuard`.
- Las acciones visibles de Compras, Cotizaciones y Solicitudes usan `*hasPermission` para ver, crear y editar.

Archivos principales:

- `src/app/components/main-pages/main-pages.component.ts`
- `src/app/components/main-pages/main-pages.component.html`
- `src/app/components/main-pages/main-pages-routing.module.ts`
- `src/app/components/main-pages/options/compras/list-compras/list-compras.component.ts`
- `src/app/components/main-pages/options/compras/list-compras/list-compras.component.html`
- `src/app/components/main-pages/options/cotizaciones/list-cotizaciones/list-cotizaciones.component.ts`
- `src/app/components/main-pages/options/cotizaciones/list-cotizaciones/list-cotizaciones.component.html`
- `src/app/components/main-pages/options/solicitud-cotizacion/list-solicitudes/list-solicitudes.component.ts`
- `src/app/components/main-pages/options/solicitud-cotizacion/list-solicitudes/list-solicitudes.component.html`

## Corrección de compilación

Se corrigió un error de Angular `NG5002` en el botón **Anular** de solicitudes: el elemento tenía a la vez `*hasPermission` y `*ngIf`. Angular solo permite una directiva estructural por elemento. Se cambió la condición de estado por `[hidden]`.

## Validaciones realizadas

El comando siguiente finalizó sin errores:

```powershell
npx tsc --noEmit -p tsconfig.app.json
```

También se verificó que Angular compile con:

```powershell
npm run start -- --port 4201
```

La compilación fue correcta. Al finalizar, se detuvieron los procesos de desarrollo que ocupaban los puertos `4200` y `4201`.

## Pruebas recomendadas para mañana

1. Iniciar el frontend con `npm run start`.
2. Probar un usuario `ROLE_Gerente` con todos los permisos: debe ver los módulos y acciones disponibles.
3. Probar un usuario limitado, por ejemplo con `COMPRA_VER`: debe ver Compras y sus detalles, pero no crear, editar, eliminar ni confirmar.
4. Probar una URL directa sin permiso: el guard debe redirigir a `/home`; el backend debe seguir respondiendo `403` si se fuerza la llamada API.
5. Provocar cinco fallos de login y comprobar en DevTools > Network que el backend devuelva `423` con `retryAfterSeconds`; el contador debe iniciar aproximadamente en ese valor.
