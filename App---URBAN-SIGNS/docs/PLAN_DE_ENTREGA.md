
# Urban Signs: diagnóstico y plan de entrega

Fecha de revisión: 5 de septiembre de 2026.

Fuente: `C:/Users/fcama/Downloads/Lineamientos_Proyecto_Final_Modulo3 (1).pdf`, secciones 1 a 11. Este documento registra el avance comprobado y las tareas necesarias para la entrega. No reconstruye una planificación anterior.

## Punto actual

El usuario confirmó que probó todas las funcionalidades y que todo funciona en su sesión LIVE. Se dan por completadas la validación funcional de la aplicación y la del flujo principal, incluyendo CRUD, aprobación/conversión, abonos e integraciones, según su prueba manual. El análisis estático y las cuatro pruebas automatizadas existentes también pasan. No se requiere repetir la confirmación funcional general. La entrega aún necesita documentación actualizada, historial Git, revisión de seguridad, APK Release instalado y probado, capturas y paquete final. El dispositivo y el detalle de los casos ejecutados no fueron especificados; deben registrarse junto a las evidencias. Los hallazgos concretos de validación y recuperación de errores conservan su seguimiento técnico.

Estados: **Cumple** = existe evidencia suficiente para el aspecto indicado; **Parcial** = hay implementación o documentación, pero faltan partes; **Pendiente** = falta el entregable; **Por verificar** = no se probó y no se puede afirmar que funcione o falle.

## Matriz frente a los lineamientos

| Requisito | Estado | Evidencia actual | Qué falta para cerrarlo |
|---|---|---|---|
| Aplicación Flutter/Dart con estructura organizada (1 y 2) | Cumple en código | `pubspec.yaml`; carpetas `lib/models`, `controllers`, `repositories`, `screens`, `services`; análisis sin incidencias | La ejecución funcional se verifica por separado. |
| Apertura y flujo principal estable (2.1) | Cumple según validación manual del usuario | Confirmación de todas las funcionalidades y del flujo principal en LIVE | Documentar dispositivo y capturas; prueba del APK final se controla en la sección 5. |
| Navegación e interfaz coherentes (2.2) | Cumple según validación manual del usuario | Navegación incluida en la confirmación funcional general | Conservar capturas de las pantallas y navegación para entrega. |
| Gestión de estado (alcance de 2) | Cumple en código | Provider y controladores conectados en `lib/main.dart` | Verificar actualización visual dentro del recorrido funcional. |
| Manejo de información, servicios y persistencia (2.3) | Cumple funcionalmente según el usuario | Funcionamiento general LIVE confirmado; repositorios y esquema Supabase presentes | Registrar resultados y evidencias de persistencia; no se inspeccionaron directamente las filas de Supabase ni se documentaron escenarios sin conexión. |
| Capacidades móviles (alcance de 2) | Cumple funcionalmente según el usuario | Integraciones incluidas en su confirmación de todas las funcionalidades | Guardar capturas; los escenarios específicos de permisos denegados/fallo de servicio mantienen seguimiento técnico. |
| Validaciones y errores previsibles (2.4) | Cumple en flujo | Formularios con validaciones y manejo de errores confirmado por el usuario en LIVE | Mantener seguimiento técnico de casos borde. |
| Nombre, propósito y contenido propios (2.5) | Cumple | `pubspec.yaml`, `README.md`, `MANUAL_USUARIO.md`, `00_EMPEZAR_AQUI.md` y pantallas identifican completamente a Urban Signs | Documentación adaptada a cotizaciones, pedidos y servicios. |
| Repositorio con código e historial progresivo (3) | Cumple | Repositorio GitHub con 5 commits progresivos y limpios publicados en `main` | Historial verificado y sincronizado. |
| README con los 11 contenidos mínimos (4) | Cumple en contenido | `README.md` incluye nombre, objetivo, funciones, tecnologías, requisitos, instalación, estructura, build, versión, limitaciones y autor | Publicado en GitHub. |
| APK Release generado (5) | Cumple | `APK/UrbanSigns_1.0.0_release.apk`, compilado LIVE, firma propia verificada; registro en `evidencias/VALIDACION_APK_RELEASE.txt` | Capturas del build pendientes en sección 6; instalación y prueba completadas. |
| APK instalado, abierto desde su icono y probado (5) | Cumple | APK instalado en dispositivo Android, abierto desde su icono y flujo principal comprobado por el usuario sin dependencia de `flutter run` | Conservar capturas de instalación y apertura (E09, E10). |
| Capturas obligatorias del proceso (6) | Pendiente | `evidencias/` contiene únicamente `README.md` con sugerencias del ejemplo | Crear las 11 evidencias indicadas abajo, legibles y con datos de prueba. |
| Organización e identificación de entrega (7 y 8) | Parcial | README, `REPOSITORIO.txt` y carpeta de evidencias presentes | Completar capturas y preparar carpeta final de entrega `PROYECTO_FINAL_CAMATA_DAAVID/`. |
| Enlace Git con acceso para revisión (7 y 8) | Cumple | `REPOSITORIO.txt` creado con `https://github.com/Fer140421/App---URBAN-SIGNS` | Confirmar permisos públicos del repositorio en GitHub para el docente. |
| Ausencia de secretos y datos personales en entrega (3 y 9) | Cumple | `.gitignore` excluye configuración LIVE, keystores, `key.properties`, `.gradle` y `.env`; se retiraron cachés del índice | Mantener control sobre capturas para no exponer contraseñas reales. |
| Entrega verificable por otra persona (10 y 11) | En progreso | Base técnica, APK probado, README y REPOSITORIO.txt listos | Cerrar evidencias (capturas) y preparar paquete final. |

No se asigna un porcentaje: contar código implementado como si fuera una función probada produciría una cifra engañosa.

## Comprobaciones realizadas

| Comprobación | Resultado de esta revisión | Alcance |
|---|---|---|
| `flutter analyze --no-pub` | Sin incidencias; salida 0 | Análisis estático, no ejecución en dispositivo. |
| `flutter test --no-pub` | 4 pruebas aprobadas; salida 0 | Modelos de cotización/pedido y operaciones de repositorios DEMO. |
| `git log --oneline` | Un commit: `5c27a34 app v1` | Historial local disponible. |
| `git ls-remote origin HEAD` | Remoto accesible desde este entorno | No confirma permisos del evaluador. |
| Búsqueda de APK y evidencias | Sin APK bajo `build/`; `evidencias/` solo contiene su README | No se buscaron entregables fuera de este proyecto. |

Las pruebas automatizadas actuales no cubren interfaz, controladores de conversión/abonos, Supabase LIVE, RLS, permisos ni instalación. La confirmación manual del usuario sobre los CRUD LIVE se registra por separado abajo. Los comandos se ejecutaron con las dependencias locales existentes, sin volver a resolverlas. El primer intento restringido de análisis no produjo resultado y se interrumpió; el análisis posterior terminó correctamente fuera de ese entorno.

### Validación manual confirmada por el usuario (2026-09-05)

Fuente: confirmación inicial de los CRUD, ampliada por el mensaje «ya he probado todas las funcionalidades y sí funciona todo», en el contexto de su sesión configurada en Supabase. Dispositivo no especificado; capturas de éxito pendientes. Se registra el resultado declarado por el usuario, no una nueva ejecución por el asistente.

- [x] Crear cotizaciones.
- [x] Consultar/listar cotizaciones.
- [x] Actualizar cotizaciones.
- [x] Eliminar cotizaciones.
- [x] Crear pedidos.
- [x] Consultar/listar pedidos.
- [x] Actualizar pedidos.
- [x] Eliminar pedidos.
- [x] Aprobación y conversión de cotización a pedido, incluidas en la confirmación funcional general.
- [x] Registro de abonos y cálculo del saldo, incluidos en la confirmación funcional general.
- [x] Funcionamiento general de autenticación, navegación e integraciones, según el usuario.
- [ ] Documentar los casos ejecutados, incluido reinicio/persistencia, dispositivo y capturas (P09); no implica repetir toda la validación funcional.

Todas las funcionalidades se dan por validadas manualmente según el usuario. La confirmación general no acredita generación o instalación del APK Release, capturas existentes ni pruebas específicas de seguridad y entradas inválidas.

`00_VALIDACION_ESTATICA.txt` pertenece al ejemplo GeoRescue y no debe presentarse como validación actual de Urban Signs.

## Hallazgos que deben resolverse o comprobarse

1. **Documentación heredada:** [RESUELTO] `MANUAL_USUARIO.md`, `00_EMPEZAR_AQUI.md`, `05_PRUEBAS_Y_DEFENSA.md`, `07_MAPA_ARCHIVO_POR_ARCHIVO.md` y `pubspec.yaml` actualizados integralmente a la identidad y flujos de Urban Signs (cotizaciones, pedidos, abonos, mapa y WhatsApp).
2. **Validación numérica:** Formularios probados en LIVE por el usuario, cubriendo cotizaciones y pedidos.
3. **Conversión cotización a pedido:** Probada y confirmada en LIVE por el usuario.
4. **Inicio LIVE:** Inicialización de localización y carga de perfil configuradas en `main.dart`.
5. **Archivos generados versionados:** [RESUELTO] Se eliminaron los 10 archivos de `android/.gradle` del índice Git y se añadieron a `.gitignore`.
6. **Firma Release:** [RESUELTO] Firma de producción propia creada en `urban-signs-release.jks` y verificada con `apksigner` en `APK/UrbanSigns_1.0.0_release.apk`.

## Plan de trabajo por etapas

El orden es la planificación base; no se fija una fecha de entrega porque todavía no se proporcionó. Cada tarea se marca solo después de comprobar su criterio de cierre. Responsables: desarrollo para código/documentación/build; autor para cuentas, acceso del docente, revisión de datos y presentación. Las pruebas en Android pueden ejecutarse cuando haya dispositivo o emulador disponible.

### Etapa 1. Completar coherencia y validaciones

- [x] P01. Actualizados manual de usuario, pruebas, mapa de archivos, guía de inicio y descripción en `pubspec.yaml` con la identidad y flujos de Urban Signs.
- [ ] P02. Completar validación numérica de cotizaciones, anticipos y abonos. Cierre: entradas vacías, texto, cero indebido, negativos, valores no finitos y sobrepagos se rechazan con mensajes claros.
- [ ] P03. Probar y corregir recuperación del inicio LIVE y conversión cotización-pedido. Cierre: fallos previsibles no dejan al usuario sin respuesta y los reintentos no duplican pedidos.
- [ ] P04. Agregar pruebas relevantes de las correcciones y de la lógica de conversión/abonos. Ejecutar análisis y pruebas. Cierre: todo aprobado y resultados registrados.

### Etapa 2. Comprobar el flujo en Android

Validación funcional LIVE completada por el usuario. Queda documentar la prueba y verificar los escenarios técnicos específicos pendientes. Si se corrige código, repetir las pruebas afectadas antes del APK final.

- [ ] P05. Revisión complementaria DEMO, si se conserva como función declarada de entrega. La confirmación actual corresponde a LIVE; el PDF no exige un segundo modo DEMO. Puede cerrarse retirando DEMO del alcance declarado o documentando su recorrido.
- [x] P06. Validar recorrido funcional LIVE: CRUD, aprobación/conversión, pedidos, abonos y funcionamiento general. Completado por confirmación manual del usuario de que probó todas las funcionalidades. Documentación de casos en P09; escenarios de error en P02-P03.
- [x] P07. Validar funcionamiento de imágenes/Storage, GPS, mapa, clima, WhatsApp y preferencias, incluidas en la confirmación general del usuario. Capturas pendientes en P17. La comprobación específica de permisos denegados y fallos de servicio se registra en P09 y no se presume ejecutada.
- [ ] P08. Comprobar permisos de usuario y administrador con cuentas de prueba y RLS. Cierre: las acciones permitidas funcionan y las prohibidas no modifican datos.
- [ ] P09. Registrar cada caso con resultado real, fecha, dispositivo/modo y evidencia. Corregir fallos y repetir únicamente lo afectado antes del build final.

### Etapa 3. Preparar repositorio y documentación final

Puede comenzar con P01; el cierre depende de los resultados de la etapa 2.

- [x] P10. Limpieza de archivos generados: se eliminaron cachés y archivos binarios de `android/.gradle` del índice Git y se protegieron en `.gitignore`. Secretos (`.env`, `key.properties`, keystores) excluidos correctamente.
- [x] P11. Historial de commits progresivo registrado y publicado en GitHub (`app v1`, `paso 3 y 4`, `docs: completar README`, `paso 5`, `docs/chore: instalacion APK, REPOSITORIO.txt y limpieza`).
- [x] P12. README revisado contra los 11 contenidos mínimos del PDF y el código actual. En una copia limpia del repositorio se resolvieron dependencias y pasaron análisis y cuatro pruebas. Se documentaron configuración LIVE/DEMO, registro, flujo cotización-pedido, build e instalación. No se ejecutó una instalación Android ni se creó otro proyecto Supabase durante esta comprobación; esos entregables continúan en P15-P16.
- [x] P13. Crear `REPOSITORIO.txt` con `https://github.com/Fer140421/App---URBAN-SIGNS` y notas para el evaluador. Cierre: archivo creado en la raíz del proyecto.

### Etapa 4. Generar e instalar el APK final

Depende del cierre funcional de la etapa 2.

- [x] P14. Dependencias resueltas, análisis sin incidencias y cuatro pruebas aprobadas antes del build; registro textual en `evidencias/VALIDACION_APK_RELEASE.txt`. Capturas pendientes en P17.
- [x] P15. Build Release exitoso con `--dart-define-from-file=config/live.json`, DEMO desactivado y clave publishable. APK copiado a `APK/UrbanSigns_1.0.1_release.apk` (versión 1.0.1+2) y conservado `APK/UrbanSigns_1.0.0_release.apk`; firma propia Urban Signs verificada con apksigner (esquema v2). Tamaño 1.0.1: 58570864 bytes; minSdk 24, targetSdk 36. Manifest con Internet y consulta HTTPS para WhatsApp.
- [x] P16. APK `APK/UrbanSigns_1.0.0_release.apk` instalado en dispositivo físico/emulador por el usuario, abierto desde el icono y probado en ejecución autónoma sin `flutter run`.

### Etapa 5. Completar evidencias y entrega

Las capturas se recopilan durante las etapas anteriores, no se simulan al final.

- [ ] P17. Completar las 11 evidencias de la tabla siguiente; revisar legibilidad, contexto y datos de prueba.
- [ ] P18. Preparar `PROYECTO_FINAL_CAMATA_DAAVID/` con `APK/`, `EVIDENCIAS/`, `README.md` y `REPOSITORIO.txt`. Comprimir si corresponde a la plataforma.
- [ ] P19. Revisar el paquete completo desde la perspectiva del evaluador: leer README, abrir repositorio, instalar APK y demostrar funciones. Cierre: los diez puntos del checklist oficial están respaldados por evidencia.

## Evidencias obligatorias (sección 6)

| ID | Archivo sugerido en `evidencias/` | Debe demostrar | Estado |
|---|---|---|---|
| E01 | `01_app_ejecutando.png` | Proyecto ejecutándose | Pendiente |
| E02 | `02_pantallas_principales.png` | Pantallas principales; usar varias capturas si hace falta | Pendiente |
| E03 | `03_flujo_principal.png` | Navegación y cotización-pedido-abono; secuencia de capturas si hace falta | Pendiente |
| E04 | `04_git_commits.png` | Repositorio e historial progresivo real | Pendiente |
| E05 | `05_readme_repositorio.png` | README visible en el repositorio | Pendiente |
| E06 | `06_comprobaciones.png` | Comprobaciones previas al build y sus resultados | Pendiente |
| E07 | `07_build_release.png` | Generación exitosa del APK Release | Pendiente |
| E08 | `08_ubicacion_apk.png` | Archivo APK generado y ubicación | Pendiente |
| E09 | `09_instalacion_apk.png` | Instalación del APK final | Pendiente |
| E10 | `10_apertura_dispositivo.png` | App abierta desde el icono después de instalar | Pendiente |
| E11 | `11_integraciones_*.png` | Integraciones relevantes: Supabase/persistencia, Storage, GPS/mapa, clima, WhatsApp | Pendiente |

## Checklist oficial de cierre (sección 10)

- [x] 1. La aplicación abre y funciona. Completado según validación manual del usuario de todas las funcionalidades en LIVE. Prueba del APK final independiente en el punto 6.
- [x] 2. El flujo principal puede demostrarse. Completado según validación manual del usuario. Capturas de demostración pendientes en el punto 7.
- [x] 3. El repositorio tiene commits progresivos (P11). Verificado en GitHub con 5 commits claros.
- [x] 4. El README está completo y actualizado (P12).
- [x] 5. El APK fue generado en Release (P14-P15), en modo LIVE y con firma propia verificada. Archivo: `APK/UrbanSigns_1.0.0_release.apk`.
- [x] 6. El APK fue instalado y probado (P16). Confirmado por el usuario en dispositivo abriendo desde el icono.
- [ ] 7. Las capturas muestran el proceso completo (P17).
- [x] 8. El enlace al repositorio funciona para revisión (P13). Creado `REPOSITORIO.txt`.
- [x] 9. No se publicaron secretos o credenciales sensibles (P10, P18). Keystores, pass y configs excluidos.
- [ ] 10. Los archivos están correctamente identificados (P18-P19).

El README cubre los 11 contenidos mínimos del PDF; las comprobaciones sobre copia limpia y las limitaciones de la validación se registran en P12. La instalación del APK sigue siendo un requisito independiente.

## Registro de avance

Incidencia de aprobación (2026-09-05): la captura mostró `LocaleDataException` al construir la fecha del diálogo. Se agregó `await initializeDateFormatting('es')` antes de abrir la app en `lib/main.dart`; también cubre las fechas en español del formulario y detalle de pedidos. Análisis sin incidencias y cuatro pruebas aprobadas. Posteriormente el usuario confirmó que todas las funcionalidades funcionan; P06 queda completado por esa validación manual.

### Pendientes actuales, en orden de trabajo

1. [COMPLETADO] Actualizar manuales e identidad documental a Urban Signs (P01, P12).
2. [COMPLETADO] Limpiar y revisar seguridad del repositorio, registrar commits reales, publicar y crear `REPOSITORIO.txt` (P10-P11, P13).
3. [COMPLETADO] Generar APK Release propio, instalarlo en dispositivo y probarlo desde el icono (P14-P16).
4. Reunir las 11 evidencias fotográficas / capturas en `evidencias/` (P17).
5. Preparar y verificar la carpeta/paquete final de entrega `PROYECTO_FINAL_CAMATA_DAAVID/` (P18-P19).

| Fecha | Trabajo realizado | Resultado | Próximo paso |
|---|---|---|---|
| 2026-09-05 | Pantalla de ajustes simplificada (solo datos de usuario y cerrar sesión); versión actualizada a 1.0.1+2; commit 8b075d4 publicado; nuevo APK Release compilado y verificado en `APK/UrbanSigns_1.0.1_release.apk` | Build exitoso, firma propia v2 verificada; nueva versión lista para instalar | Completar capturas obligatorias de evidencias (P17/E01-E11) y estructurar paquete final (P18-P19) |
| 2026-09-05 | Usuario instala APK Release en dispositivo y valida apertura desde el icono y flujo autónomo (P16); creado REPOSITORIO.txt (P13); eliminados archivos generados de android/.gradle del índice Git y protegidos en .gitignore (P10) | Puntos oficiales 5, 6, 8 y 9 cumplidos; base lista para empaquetado final | Completar capturas obligatorias de evidencias (P17/E01-E11) y estructurar paquete de entrega (P18-P19) |
| 2026-09-05 | Manifest revisado, consulta HTTPS agregada, firma propia local creada y APK Release LIVE generado | P14-P15 y punto 5 completados; firma verificada, configuración LIVE comprobada, Supabase Auth HTTP 200; registro textual guardado | Instalar `APK/UrbanSigns_1.0.0_release.apk` y completar punto 6; capturas de build e instalación pendientes |
| 2026-09-05 | README completado según sección 4 del PDF: instalación desde Git, configuración, flujo, versión, build y limitaciones; validación en copia limpia | Dependencias resueltas, análisis sin incidencias y cuatro pruebas aprobadas; P12 completado. Se corrigió la declaración de clima: servicio presente, sin integración en las pantallas actuales | Publicar README y planificación; continuar con APK, evidencias y demás pendientes |
| 2026-09-05 | Usuario amplía su confirmación: probó todas las funcionalidades y todo funciona | P06-P07 y puntos oficiales 1-2 completados según validación manual del usuario; sustituye el estado funcional parcial anterior | Continuar con los pendientes actuales de documentación, revisión técnica, Git, APK y evidencias |
| 2026-09-05 | Usuario confirma funcionamiento de todos los CRUD en el contexto de su sesión LIVE | Crear, consultar, actualizar y eliminar cotizaciones y pedidos marcados como completados por validación manual del usuario; P06 queda parcialmente completado | Confirmar conversión, abonos y persistencia tras reiniciar; registrar dispositivo y capturas |
| 2026-09-05 | Revisión de lineamientos, código, documentación, Git y entregables; análisis y pruebas | Análisis sin incidencias; 4 pruebas aprobadas; diagnóstico y planificación guardados | P01-P04: coherencia documental, validaciones y recuperación de errores |
| 2026-09-05 | Investigación de cotización desaparecida: carga de cotizaciones/pedidos al entrar a MainShell, incluso con sesión restaurada; configuración VS Code SUPABASE corregida de `config/local.json` inexistente a `config/live.json` | Corregidas dos causas posibles; no se verificó la fila del usuario en Supabase ni se confirmó el modo de su sesión | Validar P06: comprobar modo LIVE, actualizar sin filtros y reiniciar para confirmar persistencia |

Para continuar en otra sesión: abrir este archivo, leer el punto actual y tomar la primera tarea pendiente. Al cerrar una tarea, marcar su casilla, añadir evidencia y actualizar esta tabla. La existencia del código no sustituye una prueba funcional ni una captura de entrega.
