import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../controllers/pedidos_controller.dart';
import '../../core/utils/app_constants.dart';
import '../../models/pedido.dart';
import '../pedidos/registrar_entrega_sheet.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _mapController = MapController();
  String _filtro = 'TODOS'; // 'TODOS', 'LISTOS', 'ENTREGADOS'

  Color _statusColor(String status) {
    return switch (status.toUpperCase()) {
      'COMPLETADO' || 'LISTO_PARA_ENTREGA' => const Color(0xFFFFB300),
      'EN_PROCESO' || 'EN_PRODUCCION' => const Color(0xFF42A5F5),
      'ENTREGADO' || 'INSTALADO_ENTREGADO' => const Color(0xFF00E676),
      _ => const Color(0xFFB0BEC5),
    };
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PedidosController>();

    final pedidosConCoordenadas = controller.items.where((p) {
      if (p.latitud == null || p.longitud == null) return false;
      if (_filtro == 'LISTOS') return p.listoParaEntrega;
      if (_filtro == 'ENTREGADOS') return p.entregado;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF101313),
      appBar: AppBar(
        title: const Text('Mapa de Montajes y Entregas'),
        actions: [
          PopupMenuButton<String>(
            initialValue: _filtro,
            onSelected: (val) => setState(() => _filtro = val),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'TODOS', child: Text('Ver Todos los Puntos')),
              PopupMenuItem(value: 'LISTOS', child: Text('Solo Listos para Colocar')),
              PopupMenuItem(value: 'ENTREGADOS', child: Text('Solo Ya Entregados')),
            ],
            icon: const Icon(Icons.filter_alt_outlined),
          ),
          IconButton(
            onPressed: () => controller.load(),
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar',
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: const MapOptions(
              initialCenter: LatLng(AppConstants.defaultLatitude, AppConstants.defaultLongitude),
              initialZoom: 14,
            ),
            children: [
              TileLayer(
                urlTemplate: AppConstants.osmUrl,
                userAgentPackageName: 'com.urbansigns.app',
              ),
              MarkerLayer(
                markers: pedidosConCoordenadas.map((pedido) {
                  final color = _statusColor(pedido.estadoPedido);
                  return Marker(
                    point: LatLng(pedido.latitud!, pedido.longitud!),
                    width: 50,
                    height: 50,
                    child: GestureDetector(
                      onTap: () => _mostrarPrevisualizacion(context, pedido),
                      child: Container(
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black, width: 2.5),
                          boxShadow: const [
                            BoxShadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 3)),
                          ],
                        ),
                        child: Icon(
                          pedido.entregado ? Icons.check : Icons.precision_manufacturing,
                          color: Colors.black,
                          size: 24,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          // Tarjeta flotante superior informativa
          Positioned(
            left: 14,
            right: 14,
            top: 14,
            child: Card(
              color: const Color(0xFF181C1D).withValues(alpha: 0.95),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: Color(0xFF2E3537)),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.pin_drop_outlined, color: Color(0xFFFFC400), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '${pedidosConCoordenadas.length} puntos en Tarija · Filtro: $_filtro',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _mostrarPrevisualizacion(BuildContext context, Pedido pedido) async {
    final statusColor = _statusColor(pedido.estadoPedido);

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF181C1D),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'PEDIDO #${pedido.idPedido}',
                  style: const TextStyle(color: Color(0xFFFFC400), fontWeight: FontWeight.w900, fontSize: 13),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    pedido.estadoPedido.replaceAll('_', ' '),
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              pedido.nombreCliente,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
            ),
            if (pedido.direccionCliente.isNotEmpty) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: Color(0xFFA0A7A7), size: 16),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      pedido.direccionCliente,
                      style: const TextStyle(color: Color(0xFFB0BEC5), fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
            if (pedido.descripcionTrabajos.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                'Trabajos: ${pedido.descripcionTrabajos.first}',
                style: const TextStyle(color: Colors.white70, fontSize: 12),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=${pedido.latitud},${pedido.longitud}');
                      if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFFFC400),
                      side: const BorderSide(color: Color(0xFFFFC400)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: const Icon(Icons.navigation_outlined, size: 18),
                    label: const Text('Cómo llegar'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () {
                      Navigator.pop(sheetContext);
                      if (pedido.listoParaEntrega) {
                        RegistrarEntregaSheet.show(context, pedido);
                      } else {
                        context.push('/pedidos/${pedido.idPedido}');
                      }
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFFFC400),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: Icon(pedido.listoParaEntrega ? Icons.camera_alt : Icons.visibility, size: 18),
                    label: Text(
                      pedido.listoParaEntrega ? 'Entregar' : 'Ver Detalle',
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
