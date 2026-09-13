# Plan de implementacion del portal de clientes de Urban Signs

## 1. Proposito

Este documento define la planificacion completa para integrar la landing page de
Urban Signs con el backend existente y convertir el portal actualmente simulado en
un portal real para clientes.

La implementacion debe permitir que una persona o empresa pueda:

- Registrarse con una unica cuenta.
- Verificar su correo electronico.
- Iniciar y cerrar sesion.
- Recuperar su contrasena.
- Consultar y actualizar su perfil.
- Crear y consultar sus propias solicitudes de cotizacion.
- Consultar, aceptar o rechazar sus propias cotizaciones.
- Consultar sus pedidos y su seguimiento.
- Consultar sus notificaciones.

La landing page se encuentra en:

```text
C:\sistemas_desarrollo\URBAN_SIGNS\LANDING_PAGE_URBAN_SIGNS
```

El backend se encuentra en:

```text
C:\sistemas_desarrollo\URBAN_SIGNS\backend_urbansigns
```

## 2. Reglas principales del modelo

El sistema debe respetar estas reglas:

```text
Una persona o empresa = un cliente
Un cliente = maximo una cuenta
Una cuenta = maximo un cliente
Una cuenta = uno o varios roles
```

Tener varios roles no significa tener varias cuentas. Una sola cuenta puede
acumular distintas responsabilidades y permisos.

Ejemplo:

```text
Cuenta: maria@urbansigns.com
Roles:
- Vendedor
- Cliente
```

Maria conserva una sola cuenta y credenciales, aunque pueda utilizar funciones
internas y funciones del portal de clientes.

## 3. Arquitectura objetivo

### 3.1 Landing publica

- Informacion de la empresa.
- Servicios.
- Portafolio.
- Contacto.
- Registro de clientes.
- Inicio de sesion.
- Recuperacion de contrasena.

### 3.2 Portal autenticado

- Perfil del cliente.
- Solicitudes de cotizacion propias.
- Cotizaciones propias.
- Aceptacion o rechazo de cotizaciones.
- Pedidos propios.
- Seguimiento de pedidos.
- Notificaciones.

### 3.3 Separacion de endpoints

Se deben mantener separados los endpoints internos, los del portal y los
publicos:

```text
Endpoints internos
/solicitudes/**
/cotizaciones/**
/pedidos/**
/clientes/**

Endpoints del portal
/portal/me
/portal/solicitudes/**
/portal/cotizaciones/**
/portal/pedidos/**
/portal/notificaciones/**

Endpoints publicos
/public/**
/portal/auth/**
```

No se debe duplicar toda la logica de negocio. Los controladores y DTO del portal
seran especificos, pero reutilizaran servicios, repositorios y entidades cuando
sea seguro hacerlo.

## 4. Estado actual

### 4.1 Landing page

Actualmente la landing utiliza datos simulados:

- El login acepta un correo y crea un usuario local de demostracion.
- El registro no persiste datos en el backend.
- Las cotizaciones, pedidos y notificaciones se guardan en `localStorage`.
- No existe una sesion real respaldada por JWT.
- El portal visual ya contiene pantallas que pueden conectarse a la API.

### 4.2 Backend

El backend ya dispone de:

- Autenticacion con JWT.
- Refresh token y cierre de sesion.
- Recuperacion de contrasena.
- Usuarios, roles y permisos.
- Clientes persona y empresa.
- Solicitudes de cotizacion.
- Cotizaciones.
- Pedidos y estados.
- Infraestructura de correo.

Sin embargo, no existe una relacion directa y segura entre la cuenta autenticada
y el cliente al que representa. Los endpoints actuales de solicitudes,
cotizaciones y pedidos estan orientados al personal interno y pueden listar datos
de varios clientes.

## 5. Fase 0: auditoria y preparacion de datos

Antes de agregar restricciones unicas se debe revisar la base de datos existente.

### 5.1 Datos a revisar

- Correos duplicados en `users`.
- Correos duplicados en `clientes`.
- CI duplicados en `people`.
- NIT duplicados en `empresas`.
- Personas vinculadas con mas de un cliente.
- Empresas vinculadas con mas de un cliente.
- Usuarios vinculados incorrectamente con personas.
- Clientes incompletos o sin correo.
- Correos equivalentes con diferencias de mayusculas o espacios.

Estos correos deben considerarse el mismo:

```text
cliente@gmail.com
CLIENTE@GMAIL.COM
 cliente@gmail.com
```

### 5.2 Entregables

- Script SQL de diagnostico que no modifique datos.
- Reporte de inconsistencias encontradas.
- Plan de correccion de registros existentes.
- Respaldo previo a cualquier migracion de datos.

No se debe instalar un indice unico hasta resolver los duplicados incompatibles.

## 6. Fase 1: relacion uno a uno entre cuenta y cliente

### 6.1 Cambio de base de datos

Agregar a `clientes`:

```text
id_user BIGINT NULL
```

Con las siguientes restricciones:

- Clave foranea hacia `users.id_user`.
- Restriccion `UNIQUE` sobre `clientes.id_user`.
- Columna inicialmente nullable para clientes historicos sin cuenta.
- Indice para busquedas por usuario.

Ejemplo de referencia para la migracion:

```sql
ALTER TABLE clientes
ADD COLUMN id_user BIGINT;

ALTER TABLE clientes
ADD CONSTRAINT fk_clientes_user
FOREIGN KEY (id_user) REFERENCES users(id_user);

ALTER TABLE clientes
ADD CONSTRAINT uk_clientes_user
UNIQUE (id_user);
```

La migracion definitiva debe ser idempotente o estar versionada mediante la
herramienta de migraciones que se adopte.

### 6.2 Cambio en entidades

En `ClienteModel`:

```java
@OneToOne
@JoinColumn(name = "id_user", unique = true)
private UsersModel usuario;
```

Opcionalmente, en `UsersModel`:

```java
@OneToOne(mappedBy = "usuario")
private ClienteModel cliente;
```

Se debe controlar la serializacion para evitar ciclos JSON y no se deben devolver
estas entidades directamente desde los endpoints del portal.

### 6.3 Repositorios requeridos

Agregar consultas equivalentes a:

```java
Optional<ClienteModel> findByUsuario_IdUser(Long idUser);
Optional<ClienteModel> findByCorreoIgnoreCase(String correo);
Optional<ClienteModel> findByPersona_Ci(String ci);
Optional<ClienteModel> findByEmpresa_Nit(String nit);
boolean existsByUsuario_IdUser(Long idUser);
```

### 6.4 Restricciones de identidad

La base de datos debe asegurar:

```text
users.user_acces normalizado  -> UNIQUE
people.ci normalizado         -> UNIQUE
empresas.nit normalizado      -> UNIQUE
clientes.id_user              -> UNIQUE
```

El correo de autenticacion debe almacenarse en `users.user_acces`. El correo de
`clientes` puede conservarse como dato comercial o de contacto.

## 7. Fase 2: normalizacion y validacion de identidad

Crear un componente central del backend para normalizar datos antes de consultar
o guardar.

### 7.1 Correo

- Eliminar espacios al inicio y al final.
- Convertir a minusculas.
- Validar formato.
- Utilizar el valor normalizado para busquedas de unicidad.

### 7.2 CI

- Eliminar espacios innecesarios.
- Definir el tratamiento de extensiones y separadores.
- Validar el formato permitido por el negocio.

### 7.3 NIT

- Eliminar espacios.
- Definir el tratamiento de guiones o separadores.
- Validar formato y longitud.

### 7.4 Telefono

- Eliminar espacios.
- Normalizar prefijos cuando corresponda.
- Validar longitud y caracteres.

La validacion del frontend mejora la experiencia, pero el backend siempre debe
repetirla.

## 8. Fase 3: rol y permisos del cliente

Crear o asegurar el rol:

```text
Cliente
```

Permisos iniciales sugeridos:

```text
PORTAL_ACCESO
PERFIL_PROPIO_VER
PERFIL_PROPIO_EDITAR
SOLICITUD_PROPIA_CREAR
SOLICITUD_PROPIA_VER
SOLICITUD_PROPIA_EDITAR
SOLICITUD_PROPIA_CANCELAR
COTIZACION_PROPIA_VER
COTIZACION_PROPIA_RESPONDER
PEDIDO_PROPIO_VER
NOTIFICACION_PROPIA_VER
```

Reglas:

- El registro publico asigna exclusivamente el rol `Cliente`.
- El cliente nunca elige roles ni permisos durante el registro.
- Si un usuario existente se convierte en cliente, se agrega `Cliente` sin
  eliminar sus otros roles.
- Los permisos no reemplazan la validacion de propiedad del recurso.

## 9. Fase 4: verificacion de correo para registro

### 9.1 Endpoints

```http
POST /portal/auth/registro/enviar-codigo
POST /portal/auth/registro/verificar-codigo
```

Solicitud para enviar codigo:

```json
{
  "email": "cliente@correo.com"
}
```

### 9.2 Reglas

- Codigo de seis digitos.
- Fecha de expiracion.
- Numero maximo de intentos.
- Tiempo minimo entre reenvios.
- Invalidacion de codigos anteriores.
- No almacenar el codigo en texto plano.
- Limitar solicitudes por correo e IP.
- Diferenciar codigos de registro y recuperacion.
- No revelar innecesariamente si una cuenta existe.

Al verificar correctamente se puede emitir un token temporal:

```json
{
  "verificationToken": "token-temporal",
  "expiresIn": 600
}
```

El token temporal sera obligatorio para completar el registro.

## 10. Fase 5: validacion previa de identidad

Endpoint sugerido:

```http
POST /portal/auth/registro/validar-identidad
```

Persona:

```json
{
  "tipo": "PERSONA",
  "email": "cliente@correo.com",
  "ci": "1234567"
}
```

Empresa:

```json
{
  "tipo": "EMPRESA",
  "email": "contacto@empresa.com",
  "nit": "123456789"
}
```

Estados de negocio sugeridos:

```text
DISPONIBLE
CLIENTE_EXISTENTE_SIN_CUENTA
CUENTA_EXISTENTE_SIN_CLIENTE
CUENTA_YA_REGISTRADA
IDENTIDAD_EN_CONFLICTO
IDENTIDAD_REQUIERE_REVISION
```

Este endpoint no debe devolver informacion privada ni reemplaza las validaciones
que se ejecutaran dentro de la transaccion definitiva.

## 11. Fase 6: registro definitivo

### 11.1 Endpoint

```http
POST /portal/auth/registro
```

### 11.2 Registro de persona

```json
{
  "tipo": "PERSONA",
  "email": "cliente@correo.com",
  "password": "contrasena-segura",
  "verificationToken": "token-temporal",
  "persona": {
    "ci": "1234567",
    "nombre": "Juan",
    "apellidoPaterno": "Perez",
    "apellidoMaterno": "Lopez",
    "telefono": "71234567",
    "direccion": "Direccion del cliente"
  }
}
```

### 11.3 Registro de empresa

```json
{
  "tipo": "EMPRESA",
  "email": "contacto@empresa.com",
  "password": "contrasena-segura",
  "verificationToken": "token-temporal",
  "empresa": {
    "razonSocial": "Empresa ABC",
    "nit": "123456789",
    "telefono": "71234567",
    "direccion": "Direccion de la empresa"
  }
}
```

El registro completo debe ejecutarse dentro de una unica transaccion.

## 12. Casos obligatorios del registro

### 12.1 Caso A: persona o empresa completamente nueva

Condiciones:

```text
Correo nuevo
CI o NIT nuevo
Cliente inexistente
```

Acciones:

1. Crear persona o empresa.
2. Crear cliente.
3. Crear usuario.
4. Relacionar cliente y usuario.
5. Asignar rol `Cliente`.

Resultado esperado: `201 Created`.

### 12.2 Caso B: cliente existente sin cuenta

Condiciones:

```text
Persona o empresa existente
Cliente existente
clientes.id_user = null
```

Acciones:

1. Verificar CI o NIT.
2. Validar el correo o la identidad.
3. No duplicar persona, empresa ni cliente.
4. Crear el usuario.
5. Vincularlo con el cliente existente.
6. Asignar rol `Cliente`.

Si el correo almacenado es diferente, no se debe reemplazar automaticamente. El
caso requiere validacion adicional o revision administrativa.

### 12.3 Caso C: cuenta existente sin cliente

Condiciones:

```text
El correo ya existe en users
El usuario no esta vinculado con clientes
```

Acciones:

1. No crear otro usuario.
2. Solicitar inicio de sesion o validacion de credenciales.
3. Crear o encontrar el cliente correspondiente.
4. Vincular el cliente con el usuario existente.
5. Agregar rol `Cliente` sin eliminar roles anteriores.

Respuesta sugerida:

```text
ACCOUNT_EXISTS_LOGIN_REQUIRED
```

La activacion como cliente puede realizarse autenticado mediante:

```http
POST /portal/me/activar-cliente
```

### 12.4 Caso D: cliente con cuenta existente

Si `clientes.id_user` ya tiene valor, no se crea ni vincula otra cuenta.

Respuesta sugerida:

```text
ACCOUNT_ALREADY_EXISTS
```

La landing debe ofrecer inicio de sesion y recuperacion de contrasena.

### 12.5 Caso E: correo e identidad pertenecen a registros distintos

Ejemplo:

```text
El correo pertenece a Juan
El CI pertenece a Pedro
```

Se rechaza con:

```text
IDENTITY_CONFLICT
```

Nunca se deben vincular automaticamente registros incompatibles.

### 12.6 Caso F: CI o NIT existente con correo diferente

No se crea un cliente duplicado. Se debe:

- Verificar el correo previamente registrado, o
- Solicitar revision administrativa.

Respuesta sugerida:

```text
IDENTITY_REQUIRES_REVIEW
```

El mensaje publico debe ser neutral y no revelar informacion de terceros.

### 12.7 Caso G: correo nuevo pero CI o NIT con cuenta

Se rechaza el registro y se dirige al usuario a recuperacion de cuenta. No se
permite crear otra cuenta utilizando un correo diferente.

### 12.8 Caso H: registros simultaneos

Dos peticiones pueden superar una validacion inicial al mismo tiempo. Para evitar
duplicados:

- Las restricciones `UNIQUE` son obligatorias.
- Se debe capturar `DataIntegrityViolationException`.
- Se debe responder con `409 Conflict`.
- La transaccion debe revertir todos los registros parciales.

## 13. Fase 7: autenticacion real del cliente

Se evaluara reutilizar:

```http
POST /v1/user/login
POST /users/refresh
POST /users/logout
GET /users/me
```

Verificaciones necesarias:

- El rol `Cliente` se incluye en el JWT.
- Los permisos del cliente se incluyen correctamente.
- El usuario esta activo.
- El cliente esta activo.
- La relacion usuario-cliente existe y esta habilitada.
- El login no expone datos internos.
- El refresh token funciona para la landing.
- El bloqueo por intentos fallidos funciona.

Endpoint recomendado para el perfil del portal:

```http
GET /portal/me
```

Respuesta aproximada:

```json
{
  "idCliente": 25,
  "tipo": "PERSONA",
  "nombre": "Juan Perez",
  "correo": "cliente@correo.com",
  "telefono": "71234567"
}
```

El identificador puede mostrarse, pero el backend nunca confiara en un
`idCliente` recibido desde el portal para determinar la propiedad de un recurso.

## 14. Fase 8: perfil del cliente

Endpoints:

```http
GET /portal/me
PUT /portal/me
PUT /portal/me/password
```

Campos editables inicialmente:

- Telefono.
- Direccion.
- Datos de contacto no sensibles.
- Contrasena mediante el flujo correspondiente.

Campos sensibles:

- Cambio de correo: requiere nueva verificacion.
- Cambio de CI o NIT: requiere revision administrativa.
- Cambio de razon social: evaluar revision administrativa.
- Cambio de contrasena: requiere contrasena actual o recuperacion.

## 15. Fase 9: solicitudes de cotizacion propias

Endpoints:

```http
POST /portal/solicitudes
GET /portal/solicitudes
GET /portal/solicitudes/{id}
PUT /portal/solicitudes/{id}
PUT /portal/solicitudes/{id}/cancelar
```

Reglas:

- El cliente se obtiene desde la autenticacion.
- El request no contiene `idCliente`.
- Los codigos se generan en el backend.
- Solamente se consultan o modifican solicitudes propias.
- Solamente se permite modificar en estados definidos.
- Los listados deben ser paginados.
- Se deben utilizar DTO especificos del portal.
- Se debe reutilizar la logica existente sin exponer endpoints administrativos.

## 16. Fase 10: cotizaciones propias

Endpoints:

```http
GET /portal/cotizaciones
GET /portal/cotizaciones/{id}
POST /portal/cotizaciones/{id}/aceptar
POST /portal/cotizaciones/{id}/rechazar
```

Reglas:

- La cotizacion debe pertenecer al cliente autenticado.
- No mostrar costos, notas o informacion exclusivamente interna.
- Validar estado y vigencia.
- La aceptacion debe ser idempotente.
- No se deben generar pedidos duplicados.
- Registrar fecha, usuario y respuesta.
- Definir si el rechazo requiere un motivo.

## 17. Fase 11: pedidos y seguimiento

Endpoints:

```http
GET /portal/pedidos
GET /portal/pedidos/{id}
GET /portal/pedidos/{id}/seguimiento
```

Filtros sugeridos:

```text
Todos
Pendientes
En produccion
Listos
Completados
```

El DTO del portal puede contener:

- Codigo de pedido.
- Descripcion publica.
- Estado visible.
- Porcentaje de progreso.
- Total.
- Anticipo.
- Saldo pendiente.
- Estado de pago.
- Fecha estimada de entrega.
- Historial visible.
- Informacion de entrega.

No debe exponer:

- Datos de otros clientes.
- Costos internos.
- Responsables internos innecesarios.
- Observaciones privadas.
- Informacion completa de planificacion.

Se debe definir una traduccion entre estados internos y estados publicos.

Ejemplo:

```text
Estado interno       Estado mostrado
PENDIENTE            Recibido
CONFIRMADO           Confirmado
EN_PRODUCCION        En produccion
COMPLETADO           Listo o completado
CANCELADO            Cancelado
```

## 18. Fase 12: notificaciones

Endpoints iniciales:

```http
GET /portal/notificaciones
PUT /portal/notificaciones/{id}/leida
PUT /portal/notificaciones/marcar-todas
```

Eventos sugeridos:

- Solicitud recibida.
- Cotizacion preparada.
- Cotizacion por vencer.
- Cotizacion aceptada.
- Pedido creado.
- Pedido cambio de estado.
- Pedido listo para entrega.
- Pago registrado.

La primera version puede utilizar persistencia y consultas HTTP. WebSocket o
notificaciones en tiempo real pueden incorporarse en una fase posterior.

## 19. Fase 13: endpoints publicos

La informacion institucional puede permanecer estatica en Angular mientras no
requiera administracion dinamica:

- Informacion de la empresa.
- Servicios.
- Portafolio.
- Contactos.
- Horarios.

Se puede agregar inicialmente:

```http
POST /public/contacto
```

Debe incluir:

- CAPTCHA o mecanismo equivalente.
- Limite de solicitudes.
- Sanitizacion.
- Validacion de correo.
- Proteccion contra spam.

Si posteriormente se necesita administrar contenido, se agregaran endpoints
publicos de lectura y endpoints administrativos para edicion.

## 20. Fase 14: seguridad transversal

Antes de publicar el portal se debe:

- Configurar CORS para la landing y el sistema administrativo.
- Leer origenes permitidos desde variables de entorno.
- Aplicar rate limiting en login, registro, recuperacion y contacto.
- Validar propiedad del recurso en la capa de servicio.
- No recibir `idCliente` desde las operaciones del portal.
- Cifrar contrasenas con BCrypt.
- Aplicar Bean Validation en los DTO.
- Implementar manejo centralizado de excepciones.
- Estandarizar respuestas `400`, `401`, `403`, `404` y `409`.
- Auditar registro, vinculacion y cambios sensibles.
- Evitar enumeracion de cuentas.
- Configurar cookies `HttpOnly`, `Secure` y `SameSite` si se usan cookies.
- Revisar CSRF si la autenticacion utiliza cookies.
- Limitar, validar y analizar archivos adjuntos.
- No devolver entidades JPA directamente.
- Evitar incluir informacion sensible en logs.

### 20.1 Validacion de propiedad

Tener un permiso `PEDIDO_PROPIO_VER` no es suficiente. Siempre se debe comprobar:

```text
pedido.idCliente == cliente asociado con el usuario autenticado
```

Ante una solicitud de un recurso ajeno es preferible devolver `404` para no
confirmar su existencia.

## 21. Fase 15: pruebas del backend

### 21.1 Pruebas unitarias

- Normalizacion de correo.
- Normalizacion de CI.
- Normalizacion de NIT.
- Deteccion de duplicados.
- Creacion de persona nueva.
- Creacion de empresa nueva.
- Vinculacion con cliente existente.
- Cuenta existente sin cliente.
- Cliente con cuenta existente.
- Conflictos de identidad.
- Asignacion del rol `Cliente`.
- Conservacion de roles anteriores.
- Validacion de propiedad.
- Transiciones de estado permitidas.

### 21.2 Pruebas de integracion

- Registro completo de persona.
- Registro completo de empresa.
- Segundo registro con el mismo correo.
- Segundo registro con el mismo CI.
- Segundo registro con el mismo NIT.
- Cliente existente sin cuenta.
- Cuenta existente sin cliente.
- Cliente que ya tiene cuenta.
- Conflicto entre correo e identidad.
- Registros simultaneos.
- Login de cliente.
- Refresh y cierre de sesion.
- Cliente intentando usar endpoints administrativos.
- Cliente A intentando consultar datos del Cliente B.
- Cliente intentando modificar recursos en estados no permitidos.

Prueba critica:

```text
Cliente A solicita /portal/pedidos/{pedidoDeClienteB}
Resultado: 404 o 403, nunca los datos del pedido
```

## 22. Integracion con la landing page

Cuando el backend de registro este estable, realizar en Angular:

1. Crear configuracion de URL de API por ambiente.
2. Crear modelos y DTO reales.
3. Crear servicio HTTP de autenticacion.
4. Crear interceptor para JWT o cookies.
5. Reemplazar el login simulado.
6. Conectar envio y verificacion del codigo.
7. Conectar registro de persona y empresa.
8. Reemplazar el guard simulado.
9. Consumir `/portal/me`.
10. Eliminar usuarios y datos de demostracion de `localStorage`.
11. Conectar solicitudes propias.
12. Conectar cotizaciones propias.
13. Conectar pedidos y seguimiento.
14. Conectar notificaciones.
15. Manejar errores funcionales con mensajes comprensibles.

Ejemplos de traduccion de errores:

```text
ACCOUNT_ALREADY_EXISTS
-> Ya tienes una cuenta. Inicia sesion o recupera tu contrasena.

CLIENT_EXISTS_WITHOUT_ACCOUNT
-> Encontramos tus datos. Verifica tu correo para activar la cuenta.

IDENTITY_CONFLICT
-> No pudimos validar los datos. Comunicate con Urban Signs.
```

## 23. Estrategia de trabajo backend y frontend

La estrategia recomendada es una implementacion vertical:

```text
Contrato del endpoint
-> implementacion backend
-> pruebas backend
-> integracion Angular
-> prueba completa del flujo
```

Orden por funcionalidades:

1. Registro.
2. Login y sesion.
3. Perfil.
4. Solicitudes.
5. Cotizaciones.
6. Pedidos y seguimiento.
7. Notificaciones.

Esto permite detectar diferencias entre los DTO del backend y los modelos Angular
antes de acumular funcionalidades sin integrar.

## 24. Orden concreto de desarrollo

1. Crear auditoria SQL de duplicados.
2. Revisar y corregir inconsistencias existentes.
3. Crear migracion de `clientes.id_user`.
4. Agregar restricciones unicas e indices.
5. Modelar la relacion `ClienteModel` con `UsersModel`.
6. Crear consultas de repositorio por usuario, correo, CI y NIT.
7. Crear normalizacion de identidad.
8. Crear rol y permisos del cliente.
9. Crear DTO de validacion y registro.
10. Implementar envio de codigo de registro.
11. Implementar verificacion y token temporal.
12. Implementar validacion previa de identidad.
13. Implementar servicio transaccional de registro con todos los casos.
14. Crear `POST /portal/auth/registro`.
15. Crear manejo estandarizado de conflictos.
16. Probar persona nueva y empresa nueva.
17. Probar cliente existente sin cuenta.
18. Probar cuenta existente sin cliente.
19. Probar cliente con cuenta existente.
20. Probar conflictos y concurrencia.
21. Implementar `GET /portal/me`.
22. Conectar registro, login y perfil en Angular.
23. Implementar solicitudes propias.
24. Integrar solicitudes en Angular.
25. Implementar cotizaciones propias y respuesta.
26. Integrar cotizaciones en Angular.
27. Implementar pedidos y seguimiento.
28. Integrar pedidos en Angular.
29. Implementar notificaciones.
30. Ejecutar pruebas de seguridad y aceptacion completas.

## 25. Primer hito de desarrollo

El primer bloque se considera terminado cuando se demuestren estos resultados:

```text
Persona nueva               -> cuenta creada
Empresa nueva               -> cuenta creada
Cliente existente sin user  -> cuenta vinculada sin duplicar datos
Cuenta existente sin cliente-> vinculacion mediante autenticacion
Cliente con cuenta          -> duplicacion rechazada
Identidad en conflicto      -> vinculacion rechazada
```

Tambien debe comprobarse:

- Inicio de sesion real.
- Rol `Cliente` asignado.
- Relacion usuario-cliente unica.
- Restricciones de base de datos activas.
- Transacciones sin registros parciales.
- Respuestas de error consumibles por Angular.

No se debe avanzar a exponer solicitudes y pedidos hasta que la relacion entre el
usuario autenticado y el cliente sea estable, porque toda la seguridad del portal
depende de ella.

## 26. Criterios generales de finalizacion

El portal se considerara integrado cuando:

- No utilice usuarios, cotizaciones ni pedidos simulados.
- Una persona o empresa no pueda crear una segunda cuenta.
- Los clientes existentes se vinculen sin duplicarse.
- Cada operacion determine el cliente desde la autenticacion.
- Ningun cliente pueda acceder a recursos de otro cliente.
- Los endpoints administrativos conserven sus permisos actuales.
- Los DTO publicos no expongan informacion interna.
- Registro, login, solicitudes, cotizaciones y pedidos tengan pruebas automatizadas.
- La configuracion de CORS, cookies o JWT sea apropiada para produccion.
- Los flujos principales hayan sido probados de extremo a extremo.

## 27. Decisiones que deben mantenerse documentadas

Durante el desarrollo se deben registrar expresamente estas decisiones:

- Si la autenticacion de la landing usara cookie o encabezado Bearer.
- Duracion del access token y refresh token.
- Vigencia y limites de codigos de verificacion.
- Formato definitivo de CI y NIT.
- Tratamiento de clientes existentes con correo diferente.
- Procedimiento administrativo para conflictos de identidad.
- Campos editables por el cliente.
- Estados internos visibles para el cliente.
- Informacion interna excluida de los DTO publicos.
- Politica de archivos adjuntos.
- Politica de eliminacion o desactivacion de cuentas.

Estas decisiones deben resolverse antes de desplegar el portal en produccion,
aunque algunas pueden mantenerse configurables durante el desarrollo.
