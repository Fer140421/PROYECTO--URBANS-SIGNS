import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../screens/pedidos/pedido_detail_screen.dart';
import '../../screens/shell/app_gate.dart';
import '../../screens/shell/main_shell.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const AppGate(),
      ),
      GoRoute(
        path: '/pedidos',
        pageBuilder: (context, state) => MaterialPage<void>(
          key: state.pageKey,
          child: const MainShell(initialIndex: 0),
        ),
      ),
      GoRoute(
        path: '/pedidos/:id',
        pageBuilder: (context, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return MaterialPage<void>(
            key: state.pageKey,
            child: PedidoDetailScreen(idPedido: id),
          );
        },
      ),
      GoRoute(
        path: '/map',
        pageBuilder: (context, state) => MaterialPage<void>(
          key: state.pageKey,
          child: const MainShell(initialIndex: 1),
        ),
      ),
      GoRoute(
        path: '/settings',
        pageBuilder: (context, state) => MaterialPage<void>(
          key: state.pageKey,
          child: const MainShell(initialIndex: 2),
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Ruta no disponible: ${state.uri}')),
    ),
  );
}
