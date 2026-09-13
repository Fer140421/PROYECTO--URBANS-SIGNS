# 📋 Auditoría Técnica del Proyecto Back-End Spring Boot (`urban_signs`)

**Fecha:** 31 de Julio de 2026  
**Proyecto:** `URBAN_SIGNS_TALLER_III / BACK-END`  
**Tecnología Base:** Java 21, Spring Boot 3.4.5, PostgreSQL, Spring Security + JWT  

---

## 📌 Resumen Ejecutivo

Se ha realizado una auditoría exhaustiva de la arquitectura, configuración, seguridad, patrones de código y persisitiencia del backend en Spring Boot. 

Actualmente, el proyecto cuenta con una base funcional amplia que cubre múltiples módulos del negocio (clientes, compras, cotizaciones, inventario, pedidos, facturación, entre otros). Sin embargo, **presenta riesgos críticos de seguridad, deuda técnica considerable en la estructuración de la arquitectura y falta de estandarización REST**, lo cual complicará significativamente el mantenimiento y el escalado al momento de implementar **nuevos módulos**.

---

## 🚨 1. Hallazgos Críticos de Seguridad

> [!CAUTION]
>
> Estado de la correccion (12/08/2026): la configuracion ya no contiene valores secretos y ahora los recibe mediante variables de entorno. La rotacion o revocacion de las credenciales que estuvieron expuestas debe realizarse en PostgreSQL, Gmail, Cloudinary y el proveedor de facturacion.
> **Acción Inmediata Requerida**: Credenciales sensibles expuestas en el código fuente.

| Elemento | Ubicación | Diagnóstico / Riesgo | Recomendación |
| :--- | :--- | :--- | :--- |
| **Credenciales BD** | `application.properties` (L3-5) | Contraseña de PostgreSQL expuesta en texto plano (redactada). | Usar `${DB_PASSWORD}` y rotar la contraseña anterior. |
| **Firma JWT** | `application.properties` (L28) | Clave secreta JWT hardcodeada en el archivo. | Usar una clave generada dinámicamente o leída desde variable de entorno (`${JWT_SECRET}`). |
| **Servicio de Mail** | `application.properties` (L49-50) | Usuario y contraseña de Gmail SMTP expuestos (redactados). | Usar `${MAIL_USERNAME}` y `${MAIL_PASSWORD}`; revocar y crear una nueva contraseña de aplicación. |
| **Cloudinary** | `application.properties` (L55-57) | API Key y Secret de Cloudinary visibles en el repositorio. | Usar variables de entorno (`${CLOUDINARY_API_SECRET}`). |
| **Token Facturación** | `application.properties` (L61) | Token Bearer JWT de API externa expuesto. | Mover a configuración externa sensible. |
| **Anotaciones de Seguridad** | `CompraController.java` (L32, L39) | Anotaciones `@PreAuthorize("hasRole('ADMIN')")` comentadas. | Reactivar y estandarizar la seguridad a nivel de métodos en los Controllers. |
| **Configuración CORS** | `SecurityConfig.java` (L72) | Orígenes hardcodeados (`http://localhost:4200`). | Hacer configurable el origen CORS por perfil (`dev`, `prod`). |

---

## 🏗️ 2. Diagnóstico de Arquitectura y Buenas Prácticas

### 🔴 2.1. Nombres de Paquetes (Violación de Convenciones Java)
- **Estado Actual:** El proyecto utiliza mayúsculas en los nombres de paquetes: `com.example.urban_signs.Controller`, `DTO`, `Model`, `Services`, `ServicesImpl`, `Repository`, `Utils`.
- **Riesgo/Impacto:** Incumplimiento del estándar internacional de sintaxis de Java (*Java Naming Conventions*), que exige nombres de paquetes exclusivamente en minúsculas.
- **Mejora:** Renombrar paquetes a minúsculas:
  - `com.example.urban_signs.controller`
  - `com.example.urban_signs.dto`
  - `com.example.urban_signs.model` / `domain`
  - `com.example.urban_signs.service`
  - `com.example.urban_signs.service.impl`
  - `com.example.urban_signs.repository`

---

### 🔴 2.2. Exposición Directa de Entidades JPA en los Endpoints (Entity Leakage)
- **Estado Actual:** Múltiples controladores aceptan o retornan Entidades JPA (`*Model`) en lugar de DTOs.
  - Ejemplo en [ClientesController.java](file:///D:/Aplicaciones%20de%20desarrollo%20de%20software/Portfolio/URBAN_SIGNS_TALLER_III/BACK-END/src/main/java/com/example/urban_signs/Controller/ClientesController.java#L37-L45):
    ```java
    @PostMapping("/registrar")
    public ResponseEntity<ClienteModel> registrarCliente(@RequestBody ClienteModel cliente)
    ```
- **Riesgo/Impacto:**
  1. **Ataques de Mass Assignment (Asignación Masiva):** El cliente HTTP puede inyectar o modificar campos sensibles de la base de datos (IDs, fechas de creación, estados, etc.).
  2. **Errores de Serialización JSON:** Recursividad infinita o excepciones de Jackson al serializar relaciones bi-direccionales (`@OneToMany`, `@ManyToOne`).
  3. **Acoplamiento Fuerte:** Cambiar la estructura de la base de datos rompe la API consumida por el frontend.
- **Mejora:** Usar **Request DTOs** para recibir datos y **Response DTOs** para devolver las respuestas. Desacoplar la entidad JPA de la capa REST mediante mapeadores (como *MapStruct* o *Mappers* dedicados).

---

### 🔴 2.3. Ausencia de Manejo Global de Excepciones (`@RestControllerAdvice`)
- **Estado Actual:** No existe ninguna clase anotada con `@RestControllerAdvice` o `@ControllerAdvice`.
  - Las excepciones se lanzan de forma genérica en la capa de servicios:
    ```java
    throw new RuntimeException("Proveedor no encontrado");
    ```
  - Algunos controladores capturan excepciones manualmente con `try-catch` y devuelven `Map<String, String>`, mientras que otros dejan volar la excepción produciendo un error `500 Internal Server Error` sin formato uniforme.
- **Mejora:**
  1. Crear excepciones de dominio personalizadas (ej. `ResourceNotFoundException`, `BusinessRuleException`, `UnauthorizedException`).
  2. Implementar un `@RestControllerAdvice` centralizado que transforme las excepciones en respuestas HTTP estandarizadas (**RFC 7807 Problem Details** o JSON estructurado):
    ```json
    {
      "timestamp": "2026-07-31T17:00:00Z",
      "status": 404,
      "error": "Not Found",
      "message": "Proveedor no encontrado con ID: 15",
      "path": "/v1/compras"
    }
    ```

---

### 🔴 2.4. Ausencia de Validación de Entrada de Datos (Bean Validation)
- **Estado Actual:**
  - El proyecto no incluye la dependencia `spring-boot-starter-validation` en `pom.xml`.
  - No se utiliza la anotación `@Valid` en las peticiones HTTP ni anotaciones como `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Positive` en los DTOs.
  - En algunos lugares se hacen validaciones manuales frágiles (ej. `if (nuevoTipo == null || ...)` en controladores).
- **Mejora:** Agregar `spring-boot-starter-validation` y anotar todos los DTOs de entrada.

---

### 🟡 2.5. Estandarización de Endpoints RESTful
- **Estado Actual:** Varias rutas contienen verbos en la URL y mezclan convenciones de nombrado en español:
  - `POST /clientes/registrar`
  - `PUT /clientes/actualizar/{id}`
  - `DELETE /clientes/eliminar/{id}`
  - `POST /compras/crear`
  - `GET /compras/listar`
- **Impacto:** Rompe los principios de diseño de APIs RESTful. Los verbos deben expresarse a través de los métodos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Mejora (Propuesta REST Estandarizada):**
  - `POST /v1/clientes` (Crear cliente - Retornar HTTP 201 Created)
  - `GET /v1/clientes` (Listar clientes paginados)
  - `GET /v1/clientes/{id}` (Obtener cliente por ID)
  - `PUT /v1/clientes/{id}` (Actualizar cliente)
  - `DELETE /v1/clientes/{id}` (Eliminar cliente)
  - `PATCH /v1/clientes/{id}/estado` (Activar/Desactivar)

---

## 📦 3. Revisión del Build y Dependencias (`pom.xml`)

| Inconsistencia | Ubicación | Explicación | Corrección Recomendada |
| :--- | :--- | :--- | :--- |
| **Dependencia Duplicada (corregida 25/08/2026)** | `pom.xml` | `spring-boot-starter-data-jpa` estaba declarada dos veces. | Se eliminó la declaración redundante y se validó el modelo con Maven. |
| **Versión Hardcodeada** | `pom.xml` (L77) | `spring-boot-starter-security` especifica `<version>3.4.3</version>` mientras la versión padre es `3.4.5`. | Quitar la etiqueta `<version>` para delegar la gestión al BOM de Spring Boot. |
| **Mezcla Data JDBC / JPA** | `pom.xml` (L36, L40) | Incluye `spring-boot-starter-data-jdbc` y `spring-boot-starter-data-jpa` simultáneamente. | Si solo usan JPA/Hibernate, eliminar `starter-data-jdbc`. |
| **Falta de Modulo Validation** | `pom.xml` | Falta `spring-boot-starter-validation`. | Agregar la dependencia de Bean Validation. |
| **Documentación de API** | `pom.xml` | No hay OpenAPI / Swagger integrado. | Incluir `springdoc-openapi-starter-webmvc-ui` (v2.8.+). |
| **Gestor de Mapeos** | `pom.xml` | El mapeo DTO-Entidad es manual y propenso a código repetitivo. | Integrar **MapStruct** para autogenerar mappers eficientes y seguros. |

---

## 🗄️ 4. Persistencia y Control de Versiones de Base de Datos

- **Riesgo en `application.properties` (L19):**
  ```properties
  spring.jpa.hibernate.ddl-auto=update
  ```
  El uso de `ddl-auto=update` en ambientes de desarrollo compartido o producción puede alterar tablas inesperadamente, bloquear la base de datos o provocar pérdida inadvertida de datos.
- **Archivos SQL Sueltos:**
  Existen scripts sueltos en `resources` y en la raíz (`back.sql`, `script_español.sql`, `dbDiagramio.sql`, `tablas_futuras_planner.sql`).
- **Solución Recomendada:**
  1. Cambiar `spring.jpa.hibernate.ddl-auto=validate` o `none`.
  2. Implementar una herramienta de migración de base de datos como **Flyway** o **Liquibase**. Esto permite versionar los scripts de base de datos (`V1__init_schema.sql`, `V2__add_new_module.sql`) garantizando trazabilidad en todos los entornos.

### 4.1 Pool de conexiones para producción

- **Estado actual:** Spring Boot utiliza **HikariCP** automáticamente como pool de conexiones JDBC. El sistema ya reutiliza conexiones a PostgreSQL aunque todavía no tenga parámetros Hikari definidos explícitamente.
- **Objetivo:** Evitar abrir una conexión nueva por cada petición, controlar la concurrencia y proteger PostgreSQL frente a un número excesivo de conexiones.
- **Riesgo si el pool es pequeño:** Las peticiones pueden quedar esperando y producir errores de tiempo de espera como `Connection is not available`.
- **Riesgo si el pool es demasiado grande:** Aumenta el consumo de memoria y se puede superar el límite de conexiones de PostgreSQL, especialmente al desplegar varias instancias del backend.
- **Recomendación para producción:** Comenzar con un máximo conservador de 10 conexiones por instancia, externalizar la configuración y ajustarla posteriormente usando métricas reales.

```properties
spring.datasource.hikari.maximum-pool-size=${DB_POOL_MAX_SIZE:10}
spring.datasource.hikari.minimum-idle=${DB_POOL_MIN_IDLE:2}
spring.datasource.hikari.connection-timeout=${DB_POOL_CONNECTION_TIMEOUT:30000}
spring.datasource.hikari.idle-timeout=${DB_POOL_IDLE_TIMEOUT:600000}
spring.datasource.hikari.max-lifetime=${DB_POOL_MAX_LIFETIME:1800000}
spring.datasource.hikari.validation-timeout=${DB_POOL_VALIDATION_TIMEOUT:5000}
```

Para calcular el máximo permitido debe considerarse:

```text
conexiones potenciales = número de instancias del backend × maximum-pool-size
```

Antes de pasar a producción se debe verificar el límite `max_connections` de PostgreSQL, reservar conexiones para administración y monitorear conexiones activas, tiempos de espera y duración de consultas. No se recomienda aumentar el pool sin mediciones.

---

## 🧪 5. Pruebas Automatizadas (Testing & Cobertura)

- **Estado Actual:** Cobertura de pruebas en **0%**. Solo existe el test vacío predeterminado `UrbanSignsApplicationTests.java`.
- **Riesgo:** Al no existir pruebas unitarias ni de integración, cualquier refactorización o adición de **nuevos módulos** puede introducir regresiones o romper flujos existentes (ventas, compras, lotes, facturación) sin previo aviso.
- **Mejora:**
  1. Pruebas Unitarias con **JUnit 5** y **Mockito** para la capa de servicios (`ServiceTest`).
  2. Pruebas de Integración con **MockMvc** o `@SpringBootTest` para la capa de controladores (`ControllerTest`).

---

## 🗺️ 6. Hoja de Ruta para la Implementación de Nuevos Módulos

Al planificar la creación de **nuevos módulos**, se sugiere estructurar la aplicación bajo una arquitectura **Package-by-Feature (Módulos por Dominio)** en lugar de la estructura plana actual.

### 📁 Estructura Modular Sugerida

```text
com.example.urban_signs
├── config/                   # Configuraciones globales (Security, CORS, Swagger, Jackson)
├── exception/                # Manejo global de excepciones (@RestControllerAdvice)
├── shared/                   # Enums, utilidades globales, mappers comunes
└── modules/                  # 📦 Módulos del Sistema
    ├── cliente/
    │   ├── controller/       # ClientesController
    │   ├── dto/              # ClienteRequestDTO, ClienteResponseDTO
    │   ├── model/            # ClienteModel (Entity)
    │   ├── repository/       # ClienteRepository
    │   └── service/          # ClienteService y ClienteServiceImpl
    ├── compra/
    │   ├── controller/
    │   ├── dto/
    │   ├── model/
    │   ├── repository/
    │   └── service/
    └── [NUEVO_MODULO]/        # ✨ Nuevos módulos autónomos e independientes
        ├── controller/
        ├── dto/
        ├── model/
        ├── repository/
        └── service/
```

---

## 📊 7. Matriz de Prioridad de Acciones Recomendadas

| Prioridad | Acción | Categoría | Esfuerzo |
| :---: | :--- | :--- | :---: |
| 🔴 **CRÍTICA** | **Corregido (12/08/2026):** secretos extraídos a variables de entorno; `.env` está ignorado y se agregó `.env.example`. Rotar las credenciales que estuvieron expuestas. | Seguridad | Bajo |
| 🔴 **CRÍTICA** | Reactivar anotaciones `@PreAuthorize` en endpoints sensibles. | Seguridad | Bajo |
| 🟧 **ALTA** | Implementar un `@RestControllerAdvice` centralizado para manejo estandarizado de excepciones. | Arquitectura | Medio |
| 🟧 **ALTA** | Eliminar el retorno/recepción de Entidades JPA en los Controllers y usar DTOs + Validaciones (`@Valid`). | Calidad / Seguridad | Medio |
| 🟨 **MEDIA** | Limpiar y corregir el `pom.xml` (eliminar dependencias duplicadas, agregar `validation` y `springdoc`). | Build / Depts | Bajo |
| 🟨 **MEDIA** | Renombrar paquetes a minúsculas según la convención estándar de Java. | Refactor | Medio |
| 🟨 **MEDIA** | Configurar **Flyway** para migraciones SQL y desactivar `ddl-auto=update`. | Base de Datos | Medio |
| 🟦 **FUTURA** | Reorganizar el proyecto por arquitectura de Módulos (Package-by-Feature) antes de agregar nuevos módulos. | Escalabilidad | Medio |
| 🟦 **FUTURA** | Escribir suite básica de Pruebas Unitarias para servicios críticos (Compras, Cotizaciones, Pedidos). | QA | Alto |

---

> 💡 **Conclusión:** El proyecto cuenta con una lógica de negocio rica y avanzada, pero requiere esta fase previa de **saneamiento de seguridad y estandarización arquitectónica**. Realizar estas mejoras antes de integrar nuevos módulos evitará arrastrar deuda técnica y facilitará enormemente el desarrollo futuro.
