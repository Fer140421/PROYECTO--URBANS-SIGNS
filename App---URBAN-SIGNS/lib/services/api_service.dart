import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../core/config/app_config.dart';
import '../models/pedido.dart';
import 'preferences_service.dart';

class ApiService {
  ApiService({
    required this.config,
    required this.preferences,
  });

  AppConfig config;
  final PreferencesService preferences;
  String? _token;
  String? _currentUser;
  List<String> _currentRoles = [];

  String get baseUrl => config.baseUrl;
  String? get token => _token;
  String? get currentUser => _currentUser;
  List<String> get currentRoles => _currentRoles;
  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Future<void> init() async {
    _token = await preferences.getAuthToken();
    _currentUser = await preferences.getUserEmail();
    _currentRoles = await preferences.getUserRoles() ?? [];
  }

  void updateBaseUrl(String newUrl) {
    config = config.copyWith(baseUrl: newUrl);
  }

  Map<String, String> _headers({bool jsonContent = true}) {
    final headers = <String, String>{};
    if (jsonContent) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> login({
    required String userAcces,
    required String passwordAcces,
  }) async {
    if (config.demoMode) {
      _token = 'demo-jwt-token';
      _currentUser = userAcces;
      _currentRoles = ['ROLE_TALLER'];
      await preferences.setAuthToken(_token!);
      await preferences.setUserEmail(_currentUser!);
      await preferences.setUserRoles(_currentRoles);
      return {
        'success': true,
        'message': 'Ingreso en modo demo',
        'usuario': userAcces,
        'roles': _currentRoles,
      };
    }

    final url = Uri.parse('$baseUrl/v1/user/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: jsonEncode({
        'userAcces': userAcces.trim(),
        'passwordAcces': passwordAcces,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      
      // Extraer token
      String? receivedToken = data['token']?.toString();
      
      // Fallback: Si no viene en el body, intentar extraer de cabecera Set-Cookie o Authorization
      if (receivedToken == null || receivedToken.isEmpty) {
        final authHeader = response.headers['authorization'];
        if (authHeader != null && authHeader.startsWith('Bearer ')) {
          receivedToken = authHeader.substring(7);
        } else {
          final rawCookie = response.headers['set-cookie'];
          if (rawCookie != null && rawCookie.contains('jwt-token=')) {
            final match = RegExp(r'jwt-token=([^;]+)').firstMatch(rawCookie);
            if (match != null) receivedToken = match.group(1);
          }
        }
      }

      _token = receivedToken ?? 'authenticated-session';
      _currentUser = data['usuario']?.toString() ?? userAcces;
      if (data['roles'] is List) {
        _currentRoles = (data['roles'] as List).map((e) => e.toString()).toList();
      }

      await preferences.setAuthToken(_token!);
      await preferences.setUserEmail(_currentUser!);
      await preferences.setUserRoles(_currentRoles);

      return data;
    } else {
      try {
        final error = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
        throw Exception(error['message'] ?? 'Credenciales incorrectas');
      } catch (e) {
        if (e is Exception && !e.toString().contains('FormatException')) rethrow;
        throw Exception('Error al conectar con el servidor (HTTP ${response.statusCode})');
      }
    }
  }

  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    _currentRoles = [];
    await preferences.clearAuth();
  }

  Future<List<Pedido>> getPedidosListosParaEntrega() async {
    if (config.demoMode) return _demoPedidos();

    final url = Uri.parse('$baseUrl/pedidos/listos-para-entrega');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode == 200) {
      final list = jsonDecode(utf8.decode(response.bodyBytes)) as List<dynamic>;
      return list.map((item) => Pedido.fromMap(item as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Error al obtener pedidos listos para entrega: ${response.statusCode}');
    }
  }

  Future<List<Pedido>> getTodosLosPedidos({String? estado}) async {
    if (config.demoMode) return _demoPedidos();

    var path = '$baseUrl/pedidos/listPedidos?size=50&sortBy=idPedido&sortDir=desc';
    if (estado != null && estado.isNotEmpty && estado != 'TODOS') {
      path += '&estado=$estado';
    }

    final url = Uri.parse(path);
    final response = await http.get(url, headers: _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      final content = data['content'] as List<dynamic>? ?? [];
      return content.map((item) => Pedido.fromMap(item as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Error al listar pedidos: ${response.statusCode}');
    }
  }

  Future<Pedido> getDetallePedido(int idPedido) async {
    if (config.demoMode) {
      final list = _demoPedidos();
      return list.firstWhere((p) => p.idPedido == idPedido, orElse: () => list.first);
    }

    final url = Uri.parse('$baseUrl/pedidos/detalle-pedido/$idPedido');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      return Pedido.fromMap(data);
    } else {
      throw Exception('Error al obtener detalle del pedido: ${response.statusCode}');
    }
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
    if (config.demoMode) {
      await Future<void>.delayed(const Duration(milliseconds: 600));
      return {
        'success': true,
        'message': 'Entrega registrada en modo demo',
        'idPedido': idPedido,
        'estadoPedido': 'ENTREGADO',
      };
    }

    final url = Uri.parse('$baseUrl/pedidos/$idPedido/registrar-entrega');
    final request = http.MultipartRequest('POST', url);

    if (_token != null && _token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $_token';
    }

    if (latitud != null) request.fields['latitud'] = latitud.toString();
    if (longitud != null) request.fields['longitud'] = longitud.toString();
    if (observacion != null && observacion.trim().isNotEmpty) {
      request.fields['observacion'] = observacion.trim();
    }
    if (monto != null && monto > 0) {
      request.fields['monto'] = monto.toStringAsFixed(2);
      request.fields['metodoPago'] = metodoPago ?? 'EFECTIVO';
    }
    if (idEmpleado != null) {
      request.fields['idEmpleado'] = idEmpleado.toString();
    }

    if (foto != null) {
      final bytes = await foto.readAsBytes();
      final multipartFile = http.MultipartFile.fromBytes(
        'foto',
        bytes,
        filename: foto.name.isNotEmpty ? foto.name : 'evidencia_$idPedido.jpg',
      );
      request.files.add(multipartFile);
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
    } else {
      try {
        final err = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
        throw Exception(err['message'] ?? 'Error al registrar entrega');
      } catch (e) {
        if (e is Exception && !e.toString().contains('FormatException')) rethrow;
        throw Exception('Fallo en el servidor al registrar entrega (HTTP ${response.statusCode})');
      }
    }
  }

  Future<bool> checkConnection() async {
    try {
      final url = Uri.parse('$baseUrl/pedidos/listos-para-entrega');
      final res = await http.get(url, headers: _headers()).timeout(const Duration(seconds: 4));
      return res.statusCode < 500;
    } catch (_) {
      return false;
    }
  }

  List<Pedido> _demoPedidos() {
    return [
      Pedido(
        idPedido: 101,
        codCotizacion: 'COT-2026-001',
        nombreCliente: 'Farmacias San Agustín',
        telefonoCliente: '+591 78219920',
        direccionCliente: 'Av. Las Panosas #450, Centro',
        fechaPedido: DateTime.now().subtract(const Duration(days: 2)),
        estadoPedido: 'COMPLETADO',
        estadoPago: 'ANTICIPO_PAGADO',
        total: 1850.0,
        anticipo: 1000.0,
        saldoPendiente: 850.0,
        descripcionTrabajos: [
          'Letrero Luminoso Acrílico 3.2 x 1.2 m con iluminación LED blanca',
          'Rotulación de vinilo adhesivo microperforado en ventanas laterales'
        ],
        latitud: -21.5342,
        longitud: -64.7310,
      ),
      Pedido(
        idPedido: 102,
        codCotizacion: 'COT-2026-004',
        nombreCliente: 'Café & Bistro Central',
        telefonoCliente: '+591 76192834',
        direccionCliente: 'Calle General Trigo esq. Madrid',
        fechaPedido: DateTime.now().subtract(const Duration(days: 1)),
        estadoPedido: 'COMPLETADO',
        estadoPago: 'ANTICIPO_PAGADO',
        total: 2400.0,
        anticipo: 1200.0,
        saldoPendiente: 1200.0,
        descripcionTrabajos: [
          'Letras corpóreas de aluminio con neón flex cálido sobre fachada exterior'
        ],
        latitud: -21.5328,
        longitud: -64.7292,
      ),
      Pedido(
        idPedido: 103,
        codCotizacion: 'COT-2026-007',
        nombreCliente: 'Gimnasio Titanes Fitness',
        telefonoCliente: '+591 71894012',
        direccionCliente: 'Av. La Paz #1120',
        fechaPedido: DateTime.now().subtract(const Duration(days: 3)),
        estadoPedido: 'EN_PROCESO',
        estadoPago: 'ANTICIPO_PAGADO',
        total: 3100.0,
        anticipo: 1500.0,
        saldoPendiente: 1600.0,
        descripcionTrabajos: [
          'Gigantografía en lona frontlight 6.0 x 3.0 m con bastidor metálico'
        ],
        latitud: -21.5395,
        longitud: -64.7265,
      ),
      Pedido(
        idPedido: 98,
        codCotizacion: 'COT-2026-000',
        nombreCliente: 'Óptica Santa Lucía',
        telefonoCliente: '+591 65807763',
        direccionCliente: 'Calle Sucre #220',
        fechaPedido: DateTime.now().subtract(const Duration(days: 5)),
        estadoPedido: 'ENTREGADO',
        estadoPago: 'PAGADO_TOTAL',
        total: 950.0,
        anticipo: 950.0,
        saldoPendiente: 0.0,
        descripcionTrabajos: [
          'Totem publicitario vertical de PVC espumado y vinilo reflectivo'
        ],
        latitud: -21.5312,
        longitud: -64.7335,
        fotoEvidencia: 'https://res.cloudinary.com/didpv0w7x/image/upload/v1764270359/trabajos/2025-11-27/77d359b4-7339-4dd0-9440-d4f48a617125.jpg',
        observacionEntrega: 'Instalado satisfactoriamente en entrada principal con anclaje a piso.',
        fechaEntregaReal: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
  }
}
