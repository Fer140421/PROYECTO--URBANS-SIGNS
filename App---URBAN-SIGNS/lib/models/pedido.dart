class Pedido {
  const Pedido({
    required this.idPedido,
    this.idCotizacion,
    this.codCotizacion = '',
    required this.nombreCliente,
    this.telefonoCliente = '',
    this.direccionCliente = '',
    this.fechaPedido,
    this.estadoPedido = 'PENDIENTE',
    this.estadoPago = 'SIN_PAGAR',
    this.total = 0.0,
    this.anticipo = 0.0,
    this.saldoPendiente = 0.0,
    this.descripcionTrabajos = const [],
    this.latitud,
    this.longitud,
    this.fotoEvidencia,
    this.observacionEntrega,
    this.fechaEntregaReal,
    this.entregadoPor,
  });

  final int idPedido;
  final int? idCotizacion;
  final String codCotizacion;
  final String nombreCliente;
  final String telefonoCliente;
  final String direccionCliente;
  final DateTime? fechaPedido;
  final String estadoPedido;
  final String estadoPago;
  final double total;
  final double anticipo;
  final double saldoPendiente;
  final List<String> descripcionTrabajos;
  final double? latitud;
  final double? longitud;
  final String? fotoEvidencia;
  final String? observacionEntrega;
  final DateTime? fechaEntregaReal;
  final String? entregadoPor;

  bool get listoParaEntrega =>
      estadoPedido.toUpperCase() == 'COMPLETADO' ||
      estadoPedido.toUpperCase() == 'LISTO_PARA_ENTREGA';

  bool get entregado =>
      estadoPedido.toUpperCase() == 'ENTREGADO' ||
      estadoPedido.toUpperCase() == 'INSTALADO_ENTREGADO';

  bool get enProceso =>
      estadoPedido.toUpperCase() == 'EN_PROCESO' ||
      estadoPedido.toUpperCase() == 'EN_PRODUCCION';

  bool get tieneSaldoPendiente => saldoPendiente > 0.01;

  bool get tieneUbicacion => latitud != null && longitud != null;

  Pedido copyWith({
    int? idPedido,
    int? idCotizacion,
    String? codCotizacion,
    String? nombreCliente,
    String? telefonoCliente,
    String? direccionCliente,
    DateTime? fechaPedido,
    String? estadoPedido,
    String? estadoPago,
    double? total,
    double? anticipo,
    double? saldoPendiente,
    List<String>? descripcionTrabajos,
    double? latitud,
    double? longitud,
    String? fotoEvidencia,
    String? observacionEntrega,
    DateTime? fechaEntregaReal,
    String? entregadoPor,
  }) {
    return Pedido(
      idPedido: idPedido ?? this.idPedido,
      idCotizacion: idCotizacion ?? this.idCotizacion,
      codCotizacion: codCotizacion ?? this.codCotizacion,
      nombreCliente: nombreCliente ?? this.nombreCliente,
      telefonoCliente: telefonoCliente ?? this.telefonoCliente,
      direccionCliente: direccionCliente ?? this.direccionCliente,
      fechaPedido: fechaPedido ?? this.fechaPedido,
      estadoPedido: estadoPedido ?? this.estadoPedido,
      estadoPago: estadoPago ?? this.estadoPago,
      total: total ?? this.total,
      anticipo: anticipo ?? this.anticipo,
      saldoPendiente: saldoPendiente ?? this.saldoPendiente,
      descripcionTrabajos: descripcionTrabajos ?? this.descripcionTrabajos,
      latitud: latitud ?? this.latitud,
      longitud: longitud ?? this.longitud,
      fotoEvidencia: fotoEvidencia ?? this.fotoEvidencia,
      observacionEntrega: observacionEntrega ?? this.observacionEntrega,
      fechaEntregaReal: fechaEntregaReal ?? this.fechaEntregaReal,
      entregadoPor: entregadoPor ?? this.entregadoPor,
    );
  }

  factory Pedido.fromMap(Map<String, dynamic> map) {
    // Normalizar ID
    final rawId = map['idPedido'] ?? map['id_pedido'] ?? map['id'];
    final id = (rawId is num) ? rawId.toInt() : int.tryParse('$rawId') ?? 0;

    // Normalizar cliente
    String cliente = '';
    if (map['nombreCliente'] != null) {
      cliente = map['nombreCliente'].toString();
    } else if (map['cliente'] is String) {
      cliente = map['cliente'];
    } else if (map['cliente'] is Map) {
      final cMap = map['cliente'] as Map;
      if (cMap['persona'] is Map) {
        final p = cMap['persona'] as Map;
        cliente = '${p['name_people'] ?? ''} ${p['ap'] ?? ''}'.trim();
      } else if (cMap['empresa'] is Map) {
        cliente = '${(cMap['empresa'] as Map)['razon_social'] ?? ''}'.trim();
      }
    }

    // Normalizar teléfono y dirección
    String telefono = map['telefonoCliente']?.toString() ?? '';
    String direccion = map['direccionCliente']?.toString() ?? '';
    if (map['cliente'] is Map) {
      final cMap = map['cliente'] as Map;
      if (cMap['persona'] is Map) {
        final p = cMap['persona'] as Map;
        if (telefono.isEmpty) telefono = p['phone_number']?.toString() ?? '';
        if (direccion.isEmpty) direccion = p['addres']?.toString() ?? p['address']?.toString() ?? '';
      } else if (cMap['empresa'] is Map) {
        final e = cMap['empresa'] as Map;
        if (telefono.isEmpty) telefono = e['telefono']?.toString() ?? '';
        if (direccion.isEmpty) direccion = e['direccion']?.toString() ?? '';
      }
    }

    // Normalizar cotización
    String codCotizacion = map['codCotizacion']?.toString() ?? '';
    int? idCotizacion;
    if (map['idCotizacion'] is num) {
      idCotizacion = (map['idCotizacion'] as num).toInt();
    }
    if (map['cotizacion'] is Map) {
      final cot = map['cotizacion'] as Map;
      if (codCotizacion.isEmpty) codCotizacion = cot['codCotizacion']?.toString() ?? '';
      if (idCotizacion == null && cot['idCotizacion'] is num) {
        idCotizacion = (cot['idCotizacion'] as num).toInt();
      }
    } else if (map['cotizacion'] is String && codCotizacion.isEmpty) {
      codCotizacion = map['cotizacion'];
    }

    // Normalizar descripción de trabajos
    List<String> trabajos = [];
    if (map['descripcionTrabajos'] is List) {
      trabajos = (map['descripcionTrabajos'] as List).map((e) => e.toString()).toList();
    } else if (map['cotizacion'] is Map && (map['cotizacion'] as Map)['trabajos'] is List) {
      final list = (map['cotizacion'] as Map)['trabajos'] as List;
      for (final item in list) {
        if (item is Map) {
          final nom = item['nombreTrabajo'] ?? item['nombre'] ?? '';
          final desc = item['descripcion'] ?? '';
          trabajos.add('$nom ${desc.isNotEmpty ? "($desc)" : ""}'.trim());
        }
      }
    }

    // Normalizar coordenadas
    double? lat = (map['latitud'] as num?)?.toDouble() ??
        (map['latitudEntrega'] as num?)?.toDouble() ??
        (map['latitud_entrega'] as num?)?.toDouble();
    double? lng = (map['longitud'] as num?)?.toDouble() ??
        (map['longitudEntrega'] as num?)?.toDouble() ??
        (map['longitud_entrega'] as num?)?.toDouble();

    // Fechas
    DateTime? fPedido;
    final rawFecha = map['fechaPedido'] ?? map['fecha_pedido'];
    if (rawFecha != null) {
      fPedido = DateTime.tryParse(rawFecha.toString());
    }

    DateTime? fEntregaReal;
    final rawEntrega = map['fechaEntregaReal'] ?? map['fecha_entrega_real'];
    if (rawEntrega != null) {
      fEntregaReal = DateTime.tryParse(rawEntrega.toString());
    }

    return Pedido(
      idPedido: id,
      idCotizacion: idCotizacion,
      codCotizacion: codCotizacion,
      nombreCliente: cliente.isEmpty ? 'Cliente #$id' : cliente,
      telefonoCliente: telefono,
      direccionCliente: direccion,
      fechaPedido: fPedido,
      estadoPedido: (map['estadoPedido'] ?? map['estado_pedido'] ?? 'PENDIENTE').toString(),
      estadoPago: (map['estadoPago'] ?? map['estado_pago'] ?? 'SIN_PAGAR').toString(),
      total: (map['total'] as num?)?.toDouble() ?? (map['totalPedido'] as num?)?.toDouble() ?? 0.0,
      anticipo: (map['anticipo'] as num?)?.toDouble() ?? 0.0,
      saldoPendiente: (map['saldoPendiente'] as num?)?.toDouble() ??
          (map['saldo_pendiente'] as num?)?.toDouble() ??
          0.0,
      descripcionTrabajos: trabajos,
      latitud: lat,
      longitud: lng,
      fotoEvidencia: map['fotoEvidencia']?.toString() ?? map['foto_evidencia']?.toString(),
      observacionEntrega: map['observacionEntrega']?.toString() ?? map['observacion_entrega']?.toString(),
      fechaEntregaReal: fEntregaReal,
      entregadoPor: map['entregadoPor']?.toString(),
    );
  }
}
