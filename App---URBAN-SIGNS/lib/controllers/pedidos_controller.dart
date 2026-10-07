import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../models/pedido.dart';
import '../services/api_service.dart';

class PedidosController extends ChangeNotifier {
  PedidosController(this._api);

  final ApiService _api;

  final List<Pedido> _items = [];
  bool _loading = false;
  String? _error;

  List<Pedido> get items => List.unmodifiable(_items);
  bool get loading => _loading;
  String? get error => _error;

  int get total => _items.length;
  int get readyCount => _items.where((p) => p.listoParaEntrega).length;
  int get inProcessCount => _items.where((p) => p.enProceso).length;
  int get deliveredCount => _items.where((p) => p.entregado).length;

  double get totalPendingBalance =>
      _items.fold(0.0, (sum, p) => sum + p.saldoPendiente);

  Future<void> load({bool soloListos = false}) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      if (soloListos) {
        final list = await _api.getPedidosListosParaEntrega();
        _items
          ..clear()
          ..addAll(list);
      } else {
        // Obtenemos todos los pedidos y priorizamos en lista
        try {
          final todos = await _api.getTodosLosPedidos();
          _items
            ..clear()
            ..addAll(todos);
        } catch (_) {
          // Fallback a los listos para entrega si listPedidos requiere otros permisos
          final listos = await _api.getPedidosListosParaEntrega();
          _items
            ..clear()
            ..addAll(listos);
        }
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Pedido? byId(int idPedido) {
    for (final p in _items) {
      if (p.idPedido == idPedido) return p;
    }
    return null;
  }

  Future<Map<String, dynamic>> registrarEntrega({
    required int idPedido,
    XFile? foto,
    double? latitud,
    double? longitud,
    String? observacion,
    double? monto,
    String? metodoPago,
    int? idEmpleado,
  }) async {
    final response = await _api.registrarEntrega(
      idPedido: idPedido,
      foto: foto,
      latitud: latitud,
      longitud: longitud,
      observacion: observacion,
      monto: monto,
      metodoPago: metodoPago,
      idEmpleado: idEmpleado,
    );

    // Actualizar localmente el pedido
    final index = _items.indexWhere((p) => p.idPedido == idPedido);
    if (index >= 0) {
      final current = _items[index];
      final fotoUrl = response['fotoEvidencia']?.toString();
      final nuevoSaldo = (monto != null && monto > 0)
          ? (current.saldoPendiente - monto).clamp(0.0, double.infinity)
          : current.saldoPendiente;

      _items[index] = current.copyWith(
        estadoPedido: 'ENTREGADO',
        estadoPago: nuevoSaldo <= 0.01 ? 'PAGADO_TOTAL' : current.estadoPago,
        saldoPendiente: nuevoSaldo,
        fotoEvidencia: fotoUrl ?? current.fotoEvidencia,
        observacionEntrega: observacion ?? current.observacionEntrega,
        latitud: latitud ?? current.latitud,
        longitud: longitud ?? current.longitud,
        fechaEntregaReal: DateTime.now(),
      );
      notifyListeners();
    }

    return response;
  }
}
