import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/app_controller.dart';
import '../../controllers/pedidos_controller.dart';
import '../../core/config/app_config.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _urlCtrl = TextEditingController();
  bool _testingConnection = false;
  String? _testResult;
  bool _testSuccess = false;

  @override
  void initState() {
    super.initState();
    final app = context.read<AppController>();
    _urlCtrl.text = app.baseUrl;
  }

  @override
  void dispose() {
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _probarConexion() async {
    setState(() {
      _testingConnection = true;
      _testResult = null;
    });

    final app = context.read<AppController>();
    await app.setBaseUrl(_urlCtrl.text.trim());

    final ok = await app.checkConnection();
    if (mounted) {
      setState(() {
        _testingConnection = false;
        _testSuccess = ok;
        _testResult = ok
            ? '¡Conexión exitosa con el servidor de Urban Signs!'
            : 'No se pudo conectar a la URL especificada. Verifica que el backend esté corriendo.';
      });
      if (ok) {
        context.read<PedidosController>().load();
      }
    }
  }

  void _seleccionarPredefinido(String url) {
    setState(() {
      _urlCtrl.text = url;
      _testResult = null;
    });
    context.read<AppController>().setBaseUrl(url);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();

    return Scaffold(
      backgroundColor: const Color(0xFF101313),
      appBar: AppBar(
        title: const Text('Ajustes del Sistema'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Tarjeta de Usuario Operativo
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF181C1D),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF2B3133)),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 26,
                  backgroundColor: Color(0xFFFFC400),
                  child: Icon(Icons.person, color: Colors.black, size: 30),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        app.currentUser,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        app.currentRoles.isNotEmpty ? app.currentRoles.join(', ') : 'Personal de Taller / Campo',
                        style: const TextStyle(color: Color(0xFFFFC400), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. Configuración de Entornos Backend
          const Text(
            'SERVIDOR Y CONEXIÓN DE BASE DE DATOS',
            style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
          ),
          const SizedBox(height: 8),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF181C1D),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF2B3133)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'URL Base del Backend Spring Boot:',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _urlCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: 'http://10.0.2.2:8080 o https://api.tudominio.com',
                    prefixIcon: const Icon(Icons.link, color: Color(0xFFFFC400)),
                    suffixIcon: IconButton(
                      onPressed: () {
                        context.read<AppController>().setBaseUrl(_urlCtrl.text.trim());
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('URL guardada correctamente.')),
                        );
                      },
                      icon: const Icon(Icons.save, color: Color(0xFFFFC400)),
                      tooltip: 'Guardar URL',
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                const Text('Atajos rápidos de entorno:', style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11.5)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(
                      label: const Text('Emulador Android (10.0.2.2:8080)', style: TextStyle(fontSize: 11)),
                      onPressed: () => _seleccionarPredefinido(AppConfig.defaultLocalAndroid),
                    ),
                    ActionChip(
                      label: const Text('Local PC (localhost:8080)', style: TextStyle(fontSize: 11)),
                      onPressed: () => _seleccionarPredefinido(AppConfig.defaultLocalWeb),
                    ),
                    ActionChip(
                      label: const Text('Producción (Render)', style: TextStyle(fontSize: 11)),
                      onPressed: () => _seleccionarPredefinido(AppConfig.defaultProduction),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Botón Probar Conexión
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _testingConnection ? null : _probarConexion,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFFFC400),
                      side: const BorderSide(color: Color(0xFFFFC400)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    icon: _testingConnection
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFFFC400)))
                        : const Icon(Icons.wifi_tethering, size: 18),
                    label: Text(_testingConnection ? 'Verificando...' : 'Probar Conexión con Servidor'),
                  ),
                ),

                if (_testResult != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _testSuccess ? const Color(0xFF1E3A2B) : const Color(0xFF3A1E20),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _testSuccess ? Icons.check_circle : Icons.error_outline,
                          color: _testSuccess ? const Color(0xFF00E676) : Colors.redAccent,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _testResult!,
                            style: TextStyle(
                              color: _testSuccess ? const Color(0xFF00E676) : Colors.redAccent,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 3. Preferencias de Visualización
          const Text(
            'PREFERENCIAS',
            style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF181C1D),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF2B3133)),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Tema Oscuro de Alto Contraste', style: TextStyle(color: Colors.white, fontSize: 13.5)),
                  subtitle: const Text('Optimizado para uso al aire libre e instalación', style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11.5)),
                  value: app.darkMode,
                  activeThumbColor: const Color(0xFFFFC400),
                  onChanged: (val) => app.setDarkMode(val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 4. Cerrar Sesión
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () async {
                await app.signOut();
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.redAccent,
                side: const BorderSide(color: Colors.redAccent),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Cerrar Sesión Operativa', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
