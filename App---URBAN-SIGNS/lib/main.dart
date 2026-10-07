import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'controllers/app_controller.dart';
import 'controllers/pedidos_controller.dart';
import 'core/config/app_config.dart';
import 'services/api_service.dart';
import 'services/image_service.dart';
import 'services/location_service.dart';
import 'services/preferences_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es');

  final preferences = PreferencesService();
  final savedUrl = await preferences.getApiBaseUrl();
  final config = AppConfig.fromEnvironment(savedBaseUrl: savedUrl);

  final apiService = ApiService(config: config, preferences: preferences);
  final appController = AppController(apiService: apiService, preferences: preferences);
  await appController.initialize();

  final pedidosController = PedidosController(apiService);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: appController),
        ChangeNotifierProvider.value(value: pedidosController),
        Provider<ApiService>.value(value: apiService),
        Provider(create: (_) => LocationService()),
        Provider(create: (_) => ImageService()),
      ],
      child: const UrbanSignsApp(),
    ),
  );
}
