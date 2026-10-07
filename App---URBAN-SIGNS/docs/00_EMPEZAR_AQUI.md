# EMPEZAR AQUÍ: Urban Signs PRO

## Qué es Urban Signs

Es un proyecto final profesional desarrollado con Flutter para el Diplomado UAJMS (Módulo 3). Su dominio es la gestión comercial y operativa de empresas de diseño, cartelería y gigantografías.

Resuelve el desorden en la toma de medidas, cálculo de precios por metro cuadrado, conversión de cotizaciones a pedidos de producción, seguimiento de anticipos/saldos y geolocalización de instalaciones.

## Primer recorrido

1. **Iniciar sesión:** ingresar credenciales en modo LIVE (o probar en DEMO).
2. **Dashboard:** revisar métricas comerciales (cotizaciones pendientes, pedidos activos, saldo por cobrar).
3. **Crear Cotización:**
   - Ingresar cliente y teléfono.
   - Definir ancho, alto y cantidad (cálculo de área automático).
   - Tomar o subir foto de la fachada/espacio.
   - Capturar ubicación GPS o marcar en el mapa.
4. **Guardar:** los datos se persisten en Supabase.
5. **Convertir a Pedido:** desde el detalle, aprobar y registrar el anticipo.
6. **Registrar Abonos:** en el pedido, abonar montos hasta saldar.
7. **Ver Mapa:** revisar los marcadores geográficos de instalaciones.
8. **WhatsApp:** enviar mensaje directo al cliente desde la app.

## Estructura clave de código

1. `lib/main.dart` - Punto de entrada, inicialización y proveedores.
2. `lib/core/config/app_config.dart` - Configuración LIVE/DEMO.
3. `lib/controllers/` - `app_controller.dart`, `quotations_controller.dart`, `orders_controller.dart`.
4. `lib/models/` - `quotation.dart`, `order.dart`.
5. `lib/repositories/` - Repositorios Supabase y Demo en memoria.
6. `lib/screens/` - Dashboard, Cotizaciones, Pedidos, Mapa y Ajustes.
7. `lib/services/` - Ubicación, Storage de imágenes, Preferencias y WhatsApp.
