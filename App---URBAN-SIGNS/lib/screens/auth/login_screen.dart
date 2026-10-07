import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../controllers/app_controller.dart';
import '../../controllers/pedidos_controller.dart';
import '../../core/config/app_config.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  static const yellow = Color(0xFFFFC400);
  static const black = Color(0xFF101313);
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController(text: 'taller@urbansigns.com');
  final _password = TextEditingController(text: '12345');
  bool _register = false;
  bool _loading = false;
  bool _hidePassword = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _mostrarConfiguracionServidor(BuildContext context) {
    final app = context.read<AppController>();
    final urlCtrl = TextEditingController(text: app.baseUrl);
    bool testing = false;
    String? testResult;
    bool testOk = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF181C1D),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Configurar Servidor Backend',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: urlCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: _decoration('http://localhost:8080', Icons.link),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: const Text('Local PC (localhost:8080)', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      urlCtrl.text = AppConfig.defaultLocalWeb;
                      setSheetState(() => testResult = null);
                    },
                  ),
                  ActionChip(
                    label: const Text('Emulador Android (10.0.2.2:8080)', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      urlCtrl.text = AppConfig.defaultLocalAndroid;
                      setSheetState(() => testResult = null);
                    },
                  ),
                  ActionChip(
                    label: const Text('Producción (Render)', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      urlCtrl.text = AppConfig.defaultProduction;
                      setSheetState(() => testResult = null);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 14),
              if (testResult != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    testResult!,
                    style: TextStyle(
                      color: testOk ? Colors.greenAccent : Colors.redAccent,
                      fontSize: 12,
                    ),
                  ),
                ),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: testing
                          ? null
                          : () async {
                              setSheetState(() {
                                testing = true;
                                testResult = null;
                              });
                              await app.setBaseUrl(urlCtrl.text.trim());
                              final ok = await app.checkConnection();
                              setSheetState(() {
                                testing = false;
                                testOk = ok;
                                testResult = ok
                                    ? '¡Conexión exitosa con el servidor!'
                                    : 'No se pudo conectar a la URL especificada.';
                              });
                            },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: yellow,
                        side: const BorderSide(color: yellow),
                      ),
                      child: testing
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: yellow),
                            )
                          : const Text('Probar Conexión'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: () async {
                        await app.setBaseUrl(urlCtrl.text.trim());
                        if (ctx.mounted) Navigator.pop(ctx);
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: yellow,
                        foregroundColor: Colors.black,
                      ),
                      child: const Text('Guardar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    final app = context.read<AppController>();
    try {
      if (_register) {
        final ready = await app.signUp(
          fullName: _name.text,
          email: _email.text,
          password: _password.text,
        );
        if (!mounted) return;
        if (!ready && !app.demoMode) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Cuenta creada con éxito. Revisa tu correo si requiere confirmación.'),
          ));
          setState(() => _register = false);
          return;
        }
      } else {
        await app.signIn(email: _email.text, password: _password.text);
      }
      if (!mounted) return;
      context.read<PedidosController>().load();
      if (mounted) context.go('/');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error de conexión o credenciales: $e\n(URL: ${app.baseUrl})'),
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Cambiar URL',
              textColor: yellow,
              onPressed: () => _mostrarConfiguracionServidor(context),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  InputDecoration _decoration(String hint, IconData icon, {Widget? suffix}) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Color(0xFF292D2D)),
    );
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF777C7C), fontSize: 12),
      prefixIcon: Icon(icon, color: const Color(0xFFAAB0B0), size: 17),
      prefixIconConstraints: const BoxConstraints(minWidth: 42),
      suffixIcon: suffix,
      filled: true,
      fillColor: const Color(0xFF1A1D1D),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
      enabledBorder: border,
      errorBorder: border.copyWith(
        borderSide: const BorderSide(color: Colors.redAccent),
      ),
      focusedErrorBorder: border.copyWith(
        borderSide: const BorderSide(color: Colors.redAccent),
      ),
      focusedBorder: border.copyWith(
        borderSide: const BorderSide(color: yellow),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    return Scaffold(
      backgroundColor: black,
      body: Stack(children: [
        Align(
          alignment: Alignment.bottomCenter,
          child: Container(height: 220, color: yellow),
        ),
        SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(children: [
                  const _BrandHeader(),
                  const SizedBox(height: 14),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(28, 22, 28, 24),
                    decoration: BoxDecoration(
                      color: black,
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: const Color(0xFF1C2020)),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x99000000),
                          blurRadius: 18,
                          offset: Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            _register ? 'REGISTRAR TALLER / USUARIO' : 'ACCESO AL SISTEMA',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: yellow,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Center(
                            child: Container(
                              width: 58,
                              height: 2,
                              margin: const EdgeInsets.only(top: 9, bottom: 24),
                              color: yellow,
                            ),
                          ),
                          if (_register) ...[
                            const _FieldLabel('Nombre del Responsable o Taller'),
                            const SizedBox(height: 7),
                            TextFormField(
                              controller: _name,
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: _decoration('Ingresa tu nombre o empresa', Icons.business_outlined),
                              validator: (v) => (v ?? '').trim().length < 3
                                  ? 'Escribe tu nombre o empresa.'
                                  : null,
                            ),
                            const SizedBox(height: 17),
                          ],
                          const _FieldLabel('Correo o Usuario'),
                          const SizedBox(height: 7),
                          TextFormField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: _decoration('taller@urbansigns.com', Icons.email_outlined),
                            validator: (v) {
                              final val = (v ?? '').trim();
                              if (val.isEmpty) return 'Campo obligatorio.';
                              if (val.length < 3) return 'Mínimo 3 caracteres.';
                              return null;
                            },
                          ),
                          const SizedBox(height: 17),
                          const _FieldLabel('Contraseña'),
                          const SizedBox(height: 7),
                          TextFormField(
                            controller: _password,
                            obscureText: _hidePassword,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: _decoration(
                              'Ingresa tu clave de acceso',
                              Icons.lock_outline,
                              suffix: IconButton(
                                visualDensity: VisualDensity.compact,
                                onPressed: () => setState(() => _hidePassword = !_hidePassword),
                                icon: Icon(
                                  _hidePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                  color: const Color(0xFF777C7C),
                                  size: 17,
                                ),
                              ),
                            ),
                            validator: (v) {
                              final val = v ?? '';
                              if (val.isEmpty) return 'Campo obligatorio.';
                              if (val.length < 3) return 'Mínimo 3 caracteres.';
                              return null;
                            },
                          ),
                          const SizedBox(height: 28),
                          SizedBox(
                            height: 48,
                            child: FilledButton(
                              onPressed: _loading ? null : _submit,
                              style: FilledButton.styleFrom(
                                backgroundColor: yellow,
                                foregroundColor: Colors.black,
                                disabledBackgroundColor: const Color(0xFF806600),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      width: 19,
                                      height: 19,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                                    )
                                  : Text(
                                      _register ? 'Crear cuenta de taller' : 'Ingresar al sistema',
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                                    ),
                            ),
                          ),
                          if (!app.demoMode) ...[
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: _loading ? null : () => setState(() => _register = !_register),
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFFBEC3C3),
                                textStyle: const TextStyle(fontSize: 11),
                              ),
                              child: Text(_register
                                  ? '¿Ya tienes cuenta? Inicia sesión aquí'
                                  : '¿No tienes cuenta? Regístrate aquí'),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ]),
              ),
            ),
          ),
        ),
        SafeArea(
          child: Align(
            alignment: Alignment.topRight,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: IconButton(
                icon: const Icon(Icons.settings_outlined, color: Color(0xFFAAB0B0)),
                tooltip: 'Configurar Servidor Backend',
                onPressed: () => _mostrarConfiguracionServidor(context),
              ),
            ),
          ),
        ),
      ]),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
          color: Color(0xFFB9BEBE),
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      );
}

class _BrandHeader extends StatelessWidget {
  const _BrandHeader();
  @override
  Widget build(BuildContext context) => Column(children: [
        Transform.rotate(
          angle: -0.72,
          child: Container(
            width: 82,
            height: 82,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF2E3E4E), Color(0xFF101416)],
              ),
              borderRadius: BorderRadius.circular(10),
              boxShadow: const [
                BoxShadow(color: Colors.black54, blurRadius: 14, offset: Offset(0, 8)),
              ],
            ),
            child: Transform.rotate(
              angle: 0.72,
              child: const Icon(Icons.print_outlined, color: Color(0xFFFFC400), size: 42),
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'URBAN SIGNS',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.w900,
            fontStyle: FontStyle.italic,
            letterSpacing: .6,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'INDUSTRIA GRÁFICA & PUBLICIDAD',
          style: TextStyle(
            color: Color(0xFFFFC400),
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
          ),
        ),
      ]);
}
