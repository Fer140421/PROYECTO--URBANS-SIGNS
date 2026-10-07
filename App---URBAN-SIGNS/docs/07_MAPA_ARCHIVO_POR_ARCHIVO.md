# Mapa archivo por archivo: Urban Signs

## Núcleo y configuración
- `lib/main.dart`: inicializa configuración, Supabase, repositorios, localización e inyección de dependencias con Provider.
- `lib/app.dart`: MaterialApp, configuración de tema Material 3 y enrutador GoRouter.
- `lib/core/config/app_config.dart`: configuración de variables de entorno y modo (LIVE / DEMO).
- `lib/core/router/app_router.dart`: rutas de navegación de la app.
- `lib/core/theme/app_theme.dart`: paleta de colores y estilos claro/oscuro.

## Controladores y estado
- `lib/controllers/app_controller.dart`: sesión de usuario, autenticación, rol y preferencias de interfaz.
- `lib/controllers/quotations_controller.dart`: estado y operaciones CRUD de cotizaciones.
- `lib/controllers/orders_controller.dart`: estado y operaciones de pedidos, conversión de cotizaciones y registro de abonos.

## Modelos de datos
- `lib/models/quotation.dart`: modelo de cotización (cliente, medidas, área m², precio, estado, foto, GPS).
- `lib/models/order.dart`: modelo de pedido (anticipos, abonos, saldo restante, fecha de entrega y estado de fabricación).
- `lib/models/weather_snapshot.dart`: modelo para datos de clima contextuales.

## Repositorios (Patrón Repository)
- `lib/repositories/quotation_repository.dart`: interfaz/contrato de cotizaciones.
- `lib/repositories/order_repository.dart`: interfaz/contrato de pedidos.
- `lib/repositories/demo_quotation_repository.dart`: persistencia en memoria para modo DEMO.
- `lib/repositories/demo_order_repository.dart`: persistencia en memoria para pedidos DEMO.
- `lib/repositories/supabase_quotation_repository.dart`: integración CRUD remota con PostgreSQL / Supabase.
- `lib/repositories/supabase_order_repository.dart`: integración CRUD de pedidos y abonos con Supabase.

## Servicios e integraciones
- `lib/services/location_service.dart`: permisos y geolocalización GPS.
- `lib/services/image_service.dart`: captura fotográfica y subida a Supabase Storage.
- `lib/services/preferences_service.dart`: almacenamiento local de ajustes (SharedPreferences).
- `lib/services/weather_service.dart`: consumo de API meteorológica Open-Meteo.

## Pantallas (UI)
- `lib/screens/auth/login_screen.dart`: autenticación, registro y recuperación de contraseña.
- `lib/screens/home/dashboard_screen.dart`: métricas comerciales, accesos rápidos y resumen.
- `lib/screens/quotations/quotations_screen.dart`: listado y filtrado de cotizaciones.
- `lib/screens/quotations/quotation_form_screen.dart`: formulario de cotización, cálculo de área, GPS y foto.
- `lib/screens/quotations/quotation_detail_screen.dart`: detalle de cotización, botón de WhatsApp y conversión a pedido.
- `lib/screens/orders/orders_screen.dart`: listado de pedidos en producción.
- `lib/screens/orders/order_form_screen.dart`: edición manual de pedidos.
- `lib/screens/orders/order_detail_screen.dart`: detalle de pedido, estados y formulario modal de abonos.
- `lib/screens/map/map_screen.dart`: mapa interactivo OpenStreetMap con marcadores de trabajos.
- `lib/screens/settings/settings_screen.dart`: configuración de tema, preferencias y diagnóstico del sistema.
