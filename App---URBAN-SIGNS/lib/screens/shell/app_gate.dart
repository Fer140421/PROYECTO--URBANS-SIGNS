import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/app_controller.dart';
import '../auth/login_screen.dart';
import 'main_shell.dart';

class AppGate extends StatelessWidget {
  const AppGate({super.key});

  @override
  Widget build(BuildContext context) {
    return context.watch<AppController>().isAuthenticated
        ? const MainShell()
        : const LoginScreen();
  }
}
