import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/pedidos_controller.dart';
import '../../models/pedido.dart';
import '../../widgets/pedido_card.dart';
import 'registrar_entrega_sheet.dart';

class PedidosScreen extends StatefulWidget {
  const PedidosScreen({super.key});

  @override
  State<PedidosScreen> createState() => _PedidosScreenState();
}

class _PedidosScreenState extends State<PedidosScreen> {
  final _searchCtrl = TextEditingController();
  String _filtro = 'LISTOS'; // 'LISTOS', 'EN_PROCESO', 'ENTREGADOS', 'TODOS'

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<Pedido> _filtrar(List<Pedido> fuente) {
    final query = _searchCtrl.text.trim().toLowerCase();

    return fuente.where((p) {
      // Filtro de texto
      final matchQuery = query.isEmpty ||
          p.idPedido.toString().contains(query) ||
          p.codCotizacion.toLowerCase().contains(query) ||
          p.nombreCliente.toLowerCase().contains(query) ||
          p.direccionCliente.toLowerCase().contains(query) ||
          p.descripcionTrabajos.any((t) => t.toLowerCase().contains(query));

      // Filtro de estado
      final matchEstado = switch (_filtro) {
        'LISTOS' => p.listoParaEntrega,
        'EN_PROCESO' => p.enProceso,
        'ENTREGADOS' => p.entregado,
        _ => true,
      };

      return matchQuery && matchEstado;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PedidosController>();
    final filtrados = _filtrar(controller.items);

    return Scaffold(
      backgroundColor: const Color(0xFF101313),
      appBar: AppBar(
        title: const Text('Pedidos y Entregas'),
        actions: [
          IconButton(
            onPressed: () => controller.load(),
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualizar lista',
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFFFFC400),
        onRefresh: () => controller.load(),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 100),
          children: [
            // 1. Buscador
            TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13.5),
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Buscar por cliente, # pedido, cotización...',
                prefixIcon: const Icon(Icons.search, color: Color(0xFFFFC400)),
                suffixIcon: _searchCtrl.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() {});
                        },
                        icon: const Icon(Icons.close, color: Colors.grey),
                      ),
              ),
            ),
            const SizedBox(height: 12),

            // 2. Filtros Horizontales
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'Listos para Colocar (${controller.readyCount})',
                    selected: _filtro == 'LISTOS',
                    activeColor: const Color(0xFFFFB300),
                    onTap: () => setState(() => _filtro = 'LISTOS'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'En Taller (${controller.inProcessCount})',
                    selected: _filtro == 'EN_PROCESO',
                    activeColor: const Color(0xFF42A5F5),
                    onTap: () => setState(() => _filtro = 'EN_PROCESO'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Entregados (${controller.deliveredCount})',
                    selected: _filtro == 'ENTREGADOS',
                    activeColor: const Color(0xFF00E676),
                    onTap: () => setState(() => _filtro = 'ENTREGADOS'),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Todos (${controller.total})',
                    selected: _filtro == 'TODOS',
                    activeColor: Colors.white70,
                    onTap: () => setState(() => _filtro = 'TODOS'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 3. Indicador de Carga o Error
            if (controller.loading && controller.items.isEmpty) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: CircularProgressIndicator(color: Color(0xFFFFC400)),
                ),
              ),
            ] else if (controller.error != null && controller.items.isEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.redAccent),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.wifi_off, color: Colors.redAccent, size: 36),
                    const SizedBox(height: 8),
                    Text(
                      'No se pudo conectar con el servidor:\n${controller.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: () => controller.load(),
                      style: FilledButton.styleFrom(backgroundColor: Colors.redAccent),
                      child: const Text('Reintentar Conexión'),
                    ),
                  ],
                ),
              ),
            ] else if (filtrados.isEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFF181C1D),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.inbox_outlined, size: 48, color: Color(0xFFA0A7A7)),
                    const SizedBox(height: 10),
                    Text(
                      _filtro == 'LISTOS'
                          ? 'No hay pedidos pendientes de entrega o colocación.'
                          : 'No se encontraron pedidos con el criterio seleccionado.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFFB0BEC5), fontSize: 13.5),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Lista de Pedidos
              ...filtrados.map(
                (p) => PedidoCard(
                  pedido: p,
                  onRegistrarEntrega: () => RegistrarEntregaSheet.show(context, p),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
    required this.activeColor,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color activeColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? activeColor.withValues(alpha: 0.22) : const Color(0xFF181C1D),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? activeColor : const Color(0xFF2C3233),
            width: selected ? 1.4 : 1.0,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? activeColor : const Color(0xFFA0A7A7),
            fontWeight: selected ? FontWeight.w900 : FontWeight.w600,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
