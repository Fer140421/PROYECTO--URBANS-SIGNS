# Urban Signs: Manual de Usuario

Sistema móvil de gestión comercial para empresas de cartelería y gigantografías.

## Flujo principal de operación

1. **Autenticación e inicio de sesión:**
   - Registrar una cuenta con correo y contraseña o iniciar sesión con credenciales registradas.
   - Acceso seguro mediante Supabase Auth.

2. **Dashboard general:**
   - Visualizar métricas del negocio: total de cotizaciones, pedidos activos, saldo pendiente de cobro y trabajos completados.

3. **Gestión de Cotizaciones (CRUD):**
   - Desde la sección **Cotizaciones**, pulsar el botón de creación (+).
   - Ingresar datos del cliente (nombre, teléfono de contacto).
   - Especificar detalles técnicos: tipo de material/letrero, ancho y alto en metros, y cantidad.
   - Adjuntar fotografía o boceto de referencia (cámara o galería con subida a Supabase Storage).
   - Capturar ubicación de instalación mediante GPS o marcando sobre el mapa interactivo.
   - El sistema calcula automáticamente el área total en m² y el importe cotizado.
   - Guardar la cotización (se sincroniza con persistencia remota).

4. **Aprobación y conversión a Pedido:**
   - Abrir el detalle de una cotización registrada.
   - Pulsar **Aprobar y Convertir a Pedido**.
   - Definir fecha programada de entrega e indicar el anticipo inicial acordado.
   - El sistema formaliza el pedido manteniendo la trazabilidad con la cotización original.

5. **Gestión de Pedidos y Registro de Abonos:**
   - Consultar la sección de **Pedidos** para verificar estados de fabricación (*Pendiente*, *En proceso*, *Terminado*, *Entregado*).
   - Abrir detalle de pedido para registrar abonos sucesivos.
   - El sistema actualiza en tiempo real el monto pagado y el saldo restante.

6. **Geolocalización en Mapa:**
   - Abrir la sección **Mapa** para ver la distribución geográfica de los trabajos e instalaciones pendientes.

7. **Integración con WhatsApp:**
   - Desde el detalle de la cotización o pedido, pulsar el botón de WhatsApp para contactar de inmediato al cliente con el resumen de su trabajo.

8. **Ajustes y personalización:**
   - En **Ajustes**, cambiar entre tema claro/oscuro y consultar información técnica del sistema.
