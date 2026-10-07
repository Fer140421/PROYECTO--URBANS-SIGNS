import 'package:flutter/foundation.dart';

import '../services/api_service.dart';
import '../services/preferences_service.dart';

class AppController extends ChangeNotifier {
  AppController({
    required this.apiService,
    required this.preferences,
  });

  final ApiService apiService;
  final PreferencesService preferences;

  bool _darkMode = true;
  bool _initialized = false;

  bool get darkMode => _darkMode;
  bool get initialized => _initialized;
  bool get isAuthenticated => apiService.isAuthenticated;
  String get currentUser => apiService.currentUser ?? 'Operario Taller';
  List<String> get currentRoles => apiService.currentRoles;
  String get baseUrl => apiService.baseUrl;
  bool get demoMode => apiService.config.demoMode;

  bool get isTaller => currentRoles.contains('ROLE_TALLER') || currentRoles.contains('TALLER');
  bool get isOficina => currentRoles.contains('ROLE_OFICINA') || currentRoles.contains('OFICINA');

  Future<void> initialize() async {
    _darkMode = await preferences.getDarkMode();
    final savedUrl = await preferences.getApiBaseUrl();
    if (savedUrl != null && savedUrl.trim().isNotEmpty) {
      String clean = savedUrl.trim();
      final isWebOrDesktop = kIsWeb ||
          defaultTargetPlatform == TargetPlatform.windows ||
          defaultTargetPlatform == TargetPlatform.linux ||
          defaultTargetPlatform == TargetPlatform.macOS;
      if (isWebOrDesktop && clean.contains('10.0.2.2')) {
        clean = clean.replaceAll('10.0.2.2', 'localhost');
        await preferences.setApiBaseUrl(clean);
      }
      apiService.updateBaseUrl(clean);
    }
    await apiService.init();
    _initialized = true;
    notifyListeners();
  }

  Future<void> setDarkMode(bool value) async {
    _darkMode = value;
    notifyListeners();
    await preferences.setDarkMode(value);
  }

  Future<void> setBaseUrl(String newUrl) async {
    final clean = newUrl.trim();
    if (clean.isEmpty) return;
    apiService.updateBaseUrl(clean);
    await preferences.setApiBaseUrl(clean);
    notifyListeners();
  }

  Future<void> signIn({
    String? email,
    String? password,
    String? userAcces,
    String? passwordAcces,
  }) async {
    final user = (userAcces ?? email ?? '').trim();
    final pass = passwordAcces ?? password ?? '';
    await apiService.login(userAcces: user, passwordAcces: pass);
    notifyListeners();
  }

  Future<bool> signUp({
    required String fullName,
    required String email,
    required String password,
  }) async {
    throw Exception(
      'El registro de usuarios lo gestiona el administrador en el sistema web. Use sus credenciales de taller.',
    );
  }

  Future<void> signOut() async {
    await apiService.logout();
    notifyListeners();
  }

  Future<bool> checkConnection() => apiService.checkConnection();
}
