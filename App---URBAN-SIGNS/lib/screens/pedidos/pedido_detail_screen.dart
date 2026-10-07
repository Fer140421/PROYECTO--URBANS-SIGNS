import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../controllers/pedidos_controller.dart';
import '../../core/utils/app_constants.dart';
import '../../models/pedido.dart';
import 'registrar_entrega_sheet.dart';

class PedidoDetailScreen extends StatelessWidget {
  const PedidoDetailScreen({super.key, required this.idPedido});

  final int idPedido;

  Color _statusColor(String status) {
    return switch (status.toUpperCase()) {
      'COMPLETADO' || 'LISTO_PARA_ENTREGA' => const Color(0xFFFFB300),
      'EN_PROCESO' || 'EN_PRODUCCION' => const Color(0xFF42A5F5),
      'ENTREGADO' || 'INSTALADO_ENTREGADO' => const Color(0xFF00E676),
      'CANCELADO' => const Color(0xFFFF5252),
      _ => const Color(0xFFB0BEC5),
    };
  }

  String _statusLabel(String status) {
    return switch (status.toUpperCase()) {
      'COMPLETADO' || 'LISTO_PARA_ENTREGA' => 'LISTO PARA COLOCAR',
      'EN_PROCESO' || 'EN_PRODUCCION' => 'EN TALLER',
      'ENTREGADO' || 'INSTALADO_ENTREGADO' => 'ENTREGADO / COLOCADO',
      'CANCELADO' => 'CANCELADO',
      _ => status.replaceAll('_', ' ').toUpperCase(),
    };
  }

  Future<void> _abrirWhatsApp(BuildContext context, Pedido pedido) async {
    final cleanPhone = pedido.telefonoCliente.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.isEmpty) return;
    final url = Uri.parse(
      'https://wa.me/$cleanPhone?text=${Uri.encodeComponent('Hola estimado(a) ${pedido.nombreCliente}, nos comunicamos de Urban Signs.')}',
    );
    if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  Future<void> _llamar(BuildContext context, Pedido pedido) async {
    final cleanPhone = pedido.telefonoCliente.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleanPhone.isEmpty) return;
    final url = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(url)) await launchUrl(url);
  }

  Future<void> _abrirNavegacion(double lat, double lng) async {
    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PedidosController>();
    final pedido = controller.byId(idPedido);
    final currency = NumberFormat.currency(symbol: 'Bs. ', decimalDigits: 2);

    if (pedido == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF101313),
        appBar: AppBar(title: Text('Pedido #$idPedido')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Pedido no encontrado en la lista local', style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => controller.load(),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFFFFC400), foregroundColor: Colors.black),
                child: const Text('Actualizar Datos'),
              ),
            ],
          ),
        ),
      );
    }

    final statusColor = _statusColor(pedido.estadoPedido);
    final point = (pedido.latitud != null && pedido.longitud != null)
        ? LatLng(pedido.latitud!, pedido.longitud!)
        : null;

    return Scaffold(
      backgroundColor: const Color(0xFF101313),
      appBar: AppBar(
        title: Text('Pedido #${pedido.idPedido}'),
        actions: [
          IconButton(
            onPressed: () => controller.load(),
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
          ),
        ],
      ),
      bottomNavigationBar: !pedido.entregado
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF181C1D),
                border: Border(top: BorderSide(color: Color(0xFF262C2D))),
              ),
              child: SafeArea(
                child: SizedBox(
                  height: 50,
                  child: FilledButton.icon(
                    onPressed: () => RegistrarEntregaSheet.show(context, pedido),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFFFC400),
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.camera_alt, size: 20),
                    label: const Text(
                      'REGISTRAR ENTREGA Y COLOCACIÓN',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                    ),
                  ),
                ),
              ),
            )
          : null,
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        children: [
          // 1. Estado y Banner de Entrega
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF181C1D),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: statusColor.withValues(alpha: 0.6), width: 1.5),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _statusLabel(pedido.estadoPedido),
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.w900, fontSize: 14),
                    ),
                    if (pedido.codCotizacion.isNotEmpty)
                      Text(
                        'Cotización: ${pedido.codCotizacion}',
                        style: const TextStyle(color: Color(0xFFA0A7A7), fontSize: 12),
                      ),
                  ],
                ),
                if (pedido.entregado)
                  const Icon(Icons.check_circle, color: Color(0xFF00E676), size: 30)
                else
                  const Icon(Icons.schedule, color: Color(0xFFFFC400), size: 30),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 2. Si ya está entregado: Mostrar Evidencia Fotográfica y Fecha
          if (pedido.fotoEvidencia != null && pedido.fotoEvidencia!.isNotEmpty) ...[
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF181C1D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00E676).withValues(alpha: 0.6)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(
                        pedido.fotoEvidencia!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          color: const Color(0xFF262C2D),
                          child: const Center(
                            child: Icon(Icons.broken_image, color: Colors.grey, size: 40),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.verified, size: 16, color: Color(0xFF00E676)),
                            SizedBox(width: 6),
                            Text(
                              'Evidencia Fotográfica de Entrega',
                              style: TextStyle(color: Color(0xFF00E676), fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                        if (pedido.fechaEntregaReal != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Fecha: ${DateFormat('dd/MM/yyyy HH:mm').format(pedido.fechaEntregaReal!)}',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                        if (pedido.observacionEntrega != null && pedido.observacionEntrega!.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Notas: ${pedido.observacionEntrega}',
                            style: const TextStyle(color: Colors.white, fontSize: 12.5),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          // 3. Datos del Cliente
          _CardContainer(
            title: 'Datos del Cliente',
            icon: Icons.person_outline,
            children: [
              Text(
                pedido.nombreCliente,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
              ),
              const SizedBox(height: 6),
              if (pedido.telefonoCliente.isNotEmpty)
                Row(
                  children: [
                    const Icon(Icons.phone_outlined, size: 15, color: Color(0xFFA0A7A7)),
                    const SizedBox(width: 6),
                    Text(pedido.telefonoCliente, style: const TextStyle(color: Color(0xFFD2D7D7), fontSize: 13)),
                    const Spacer(),
                    IconButton(
                      onPressed: () => _abrirWhatsApp(context, pedido),
                      icon: const Icon(Icons.chat, color: Color(0xFF00E676), size: 20),
                      tooltip: 'WhatsApp',
                    ),
                    IconButton(
                      onPressed: () => _llamar(context, pedido),
                      icon: const Icon(Icons.phone, color: Color(0xFF42A5F5), size: 20),
                      tooltip: 'Llamar',
                    ),
                  ],
                ),
              if (pedido.direccionCliente.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFFFFC400)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        pedido.direccionCliente,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
          const SizedBox(height: 14),

          // 4. Trabajos a Colocar
          _CardContainer(
            title: 'Trabajos y Cartelería a Colocar',
            icon: Icons.precision_manufacturing_outlined,
            children: [
              if (pedido.descripcionTrabajos.isEmpty)
                const Text('Sin descripción detallada de trabajos', style: TextStyle(color: Colors.grey, fontSize: 13))
              else
                ...pedido.descripcionTrabajos.map(
                  (trabajo) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🔧 ', style: TextStyle(fontSize: 14)),
                        Expanded(
                          child: Text(
                            trabajo,
                            style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.3),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),

          // 5. Estado de Pagos y Saldos
          _CardContainer(
            title: 'Estado Financiero',
            icon: Icons.payments_outlined,
            children: [
              _RowItem(label: 'Total Pedido:', value: currency.format(pedido.total)),
              _RowItem(label: 'Anticipo Pagado:', value: currency.format(pedido.anticipo)),
              _RowItem(
                label: 'Saldo Pendiente:',
                value: pedido.tieneSaldoPendiente ? currency.format(pedido.saldoPendiente) : '✓ PAGADO TOTAL',
                valueColor: pedido.tieneSaldoPendiente ? const Color(0xFFFFC400) : const Color(0xFF00E676),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 6. Mapa de Ubicación
          if (point != null) ...[
            _CardContainer(
              title: 'Ubicación para Montaje',
              icon: Icons.map_outlined,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    height: 200,
                    child: FlutterMap(
                      options: MapOptions(initialCenter: point, initialZoom: 15),
                      children: [
                        TileLayer(
                          urlTemplate: AppConstants.osmUrl,
                          userAgentPackageName: 'com.urbansigns.app',
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: point,
                              width: 44,
                              height: 44,
                              child: const Icon(Icons.location_on, color: Color(0xFFFFC400), size: 40),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _abrirNavegacion(point.latitude, point.longitude),
                    icon: const Icon(Icons.navigation_outlined, size: 16),
                    label: const Text('Cómo llegar (Abrir en Google Maps)'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFFFC400),
                      side: const BorderSide(color: Color(0xFFFFC400)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _CardContainer extends StatelessWidget {
  const _CardContainer({required this.title, required this.icon, required this.children});
  final String title;
  final IconData icon;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF181C1D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2B3133), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: const Color(0xFFFFC400)),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13.5),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _RowItem extends StatelessWidget {
  const _RowItem({required this.label, required this.value, this.valueColor});
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFFA0A7A7), fontSize: 12.5)),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
