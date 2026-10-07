# Pruebas y defensa: Urban Signs

## Casos de prueba mínimos

| ID | Caso | Resultado esperado |
|---|---|---|
| CP-01 | Login válido | Abre la aplicación y carga el Dashboard |
| CP-02 | Login con credenciales inválidas | Muestra mensaje de error controlado |
| CP-03 | Crear cotización con dimensiones | Calcula área en m² y precio; guarda en base de datos |
| CP-04 | Captura de ubicación GPS | Obtiene coordenadas de instalación en el formulario |
| CP-05 | Denegación de GPS | Permite seleccionar ubicación manualmente en el mapa |
| CP-06 | Subir imagen de diseño | Carga fotografía al bucket de Supabase Storage |
| CP-07 | Aprobar y convertir a pedido | Cambia estado de cotización y genera nuevo pedido con anticipo |
| CP-08 | Registrar abonos parciales | Suma pagos, descuenta del saldo y actualiza balance en tiempo real |
| CP-09 | Enlace a WhatsApp | Abre chat de WhatsApp con datos prellenados del cliente/trabajo |
| CP-10 | Visualización en Mapa | Muestra marcadores interactivos con los trabajos georreferenciados |
| CP-11 | Seguridad RLS en base de datos | Los usuarios solo acceden o modifican registros autorizados |
| CP-12 | Persistencia de preferencias | El modo de tema (claro/oscuro) persiste tras reiniciar la app |
| CP-13 | APK Release independiente | Se instala en dispositivo Android y ejecuta sin dependencia de desarrollo |

## Estructura para la defensa oral (7 minutos)

1. **Problema y propuesta de valor (40 s):** Dificultades comerciales en talleres de cartelería y cómo Urban Signs digitaliza la toma de medidas, cotización y producción.
2. **Arquitectura limpia por capas (50 s):** Modelos, Repositorios (patrón Repository con soporte DEMO y Supabase), Controladores (Provider) y Vistas.
3. **Demostración funcional en vivo (3 min):**
   - Flujo completo: Cotización ➔ Medidas ➔ Foto/GPS ➔ Aprobación ➔ Pedido ➔ Abonos ➔ Saldo.
   - Envío de notificación por WhatsApp.
4. **Seguridad y Persistencia (1 min):** Supabase Auth, PostgreSQL con políticas RLS y Storage para archivos.
5. **Calidad de software y pruebas (40 s):** Pruebas unitarias de modelos/repositorios y `flutter analyze` en 0 errores.
6. **Entrega y distribución (50 s):** Repositorio GitHub con historial progresivo, APK release firmado e instalado en dispositivo.
