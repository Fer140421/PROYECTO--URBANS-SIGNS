import 'package:flutter/foundation.dart';

class AppConfig {
  static const String defaultLocalAndroid = 'http://10.0.2.2:8080';
  static const String defaultLocalWeb = 'http://localhost:8080';
  static const String defaultProduction = 'https://api-urbanworks.onrender.com';

  const AppConfig({
    required this.baseUrl,
    this.demoMode = false,
  });

  final String baseUrl;
  final bool demoMode;

  AppConfig copyWith({
    String? baseUrl,
    bool? demoMode,
  }) {
    return AppConfig(
      baseUrl: baseUrl ?? this.baseUrl,
      demoMode: demoMode ?? this.demoMode,
    );
  }

  factory AppConfig.fromEnvironment({String? savedBaseUrl}) {
    const envUrl = String.fromEnvironment('API_URL');
    const demoRaw = String.fromEnvironment('DEMO_MODE', defaultValue: 'false');
    final demoMode = demoRaw.toLowerCase() == 'true';

    final isWebOrDesktop = kIsWeb ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.linux ||
        defaultTargetPlatform == TargetPlatform.macOS;

    String resolved;
    if (savedBaseUrl != null && savedBaseUrl.trim().isNotEmpty) {
      resolved = savedBaseUrl.trim();
      // Si corre en Web/PC y había quedado guardado 10.0.2.2, auto-corregir a localhost
      if (isWebOrDesktop && resolved.contains('10.0.2.2')) {
        resolved = resolved.replaceAll('10.0.2.2', 'localhost');
      }
    } else if (envUrl.isNotEmpty) {
      resolved = envUrl;
    } else {
      // Detección automática según la plataforma de ejecución
      resolved = isWebOrDesktop ? defaultLocalWeb : defaultProduction;
    }

    return AppConfig(
      baseUrl: resolved,
      demoMode: demoMode,
    );
  }
}
