import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/pedido.dart';

class PedidoCard extends StatelessWidget {
  const PedidoCard({
    super.key,
    required this.pedido,
    this.onRegistrarEntrega,
  });

  final Pedido pedido;
  final VoidCallback? onRegistrarEntrega;

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

  Future<void> _abrirWhatsApp(BuildContext context) async {
    final cleanPhone = pedido.telefonoCliente.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.isEmpty) return;

    final url = Uri.parse(
      'https://wa.me/$cleanPhone?text=${Uri.encodeComponent('Hola estimado(a) ${pedido.nombreCliente}, nos comunicamos de Urban Signs respecto a su pedido #${pedido.idPedido}.')}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _llamar(BuildContext context) async {
    final cleanPhone = pedido.telefonoCliente.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleanPhone.isEmpty) return;

    final url = Uri.parse('tel:$cleanPhone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(pedido.estadoPedido);
    final currency = NumberFormat.currency(symbol: 'Bs. ', decimalDigits: 2);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF181C1D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: pedido.listoParaEntrega
              ? const Color(0xFFFFC400).withValues(alpha: 0.6)
              : const Color(0xFF2B3133),
          width: pedido.listoParaEntrega ? 1.5 : 1.0,
        ),
        boxShadow: [
          if (pedido.listoParaEntrega)
            BoxShadow(
              color: const Color(0xFFFFC400).withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/pedidos/${pedido.idPedido}'),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Cabecera: # Pedido y Estado
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF262C2D),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'PEDIDO #${pedido.idPedido}',
                            style: const TextStyle(
                              color: Color(0xFFFFC400),
                              fontWeight: FontWeight.w900,
                              fontSize: 12.5,
                            ),
                          ),
                        ),
                        if (pedido.codCotizacion.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          Text(
                            pedido.codCotizacion,
                            style: const TextStyle(color: Color(0xFFA0A7A7), fontSize: 11.5),
                          ),
                        ],
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: statusColor.withValues(alpha: 0.7)),
                      ),
                      child: Text(
                        _statusLabel(pedido.estadoPedido),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.w900,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Cliente
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.person_outline, size: 18, color: Color(0xFFFFC400)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        pedido.nombreCliente,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    if (pedido.telefonoCliente.isNotEmpty) ...[
                      InkWell(
                        onTap: () => _abrirWhatsApp(context),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Color(0xFF1E3A2B),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.chat, size: 16, color: Color(0xFF00E676)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () => _llamar(context),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: Color(0xFF1E283A),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.phone, size: 16, color: Color(0xFF42A5F5)),
                        ),
                      ),
                    ],
                  ],
                ),

                // Dirección
                if (pedido.direccionCliente.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: Color(0xFFA0A7A7)),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          pedido.direccionCliente,
                          style: const TextStyle(color: Color(0xFFB0BEC5), fontSize: 12.5),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],

                // Trabajos a colocar
                if (pedido.descripcionTrabajos.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF121515),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF262C2D)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TRABAJOS A INSTALAR:',
                          style: TextStyle(
                            color: Color(0xFF8B9292),
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        ...pedido.descripcionTrabajos.take(2).map(
                              (t) => Padding(
                                padding: const EdgeInsets.only(top: 2),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('• ', style: TextStyle(color: Color(0xFFFFC400))),
                                    Expanded(
                                      child: Text(
                                        t,
                                        style: const TextStyle(color: Colors.white, fontSize: 12),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        if (pedido.descripcionTrabajos.length > 2)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              '+ ${pedido.descripcionTrabajos.length - 2} trabajo(s) más...',
                              style: const TextStyle(color: Color(0xFFFFC400), fontSize: 11),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 12),
                const Divider(color: Color(0xFF262C2D), height: 1),
                const SizedBox(height: 10),

                // Barra inferior: Saldo pendiente + Botón de Acción
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pedido.tieneSaldoPendiente ? 'Saldo por Cobrar:' : 'Pago:',
                          style: const TextStyle(color: Color(0xFFA0A7A7), fontSize: 11),
                        ),
                        Text(
                          pedido.tieneSaldoPendiente
                              ? currency.format(pedido.saldoPendiente)
                              : '✓ PAGADO TOTAL',
                          style: TextStyle(
                            color: pedido.tieneSaldoPendiente ? const Color(0xFFFFC400) : const Color(0xFF00E676),
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    if (pedido.listoParaEntrega) ...[
                      FilledButton.icon(
                        onPressed: onRegistrarEntrega ?? () => context.push('/pedidos/${pedido.idPedido}'),
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFFFFC400),
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.camera_alt, size: 16),
                        label: const Text(
                          'Registrar Entrega',
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
                        ),
                      ),
                    ] else if (pedido.entregado) ...[
                      const Row(
                        children: [
                          Icon(Icons.check_circle, size: 16, color: Color(0xFF00E676)),
                          SizedBox(width: 4),
                          Text(
                            'Completado',
                            style: TextStyle(color: Color(0xFF00E676), fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                    ] else ...[
                      OutlinedButton(
                        onPressed: () => context.push('/pedidos/${pedido.idPedido}'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFA0A7A7),
                          side: const BorderSide(color: Color(0xFF373E40)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Ver Detalle', style: TextStyle(fontSize: 11.5)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
