import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../controllers/pedidos_controller.dart';
import '../map/map_screen.dart';
import '../pedidos/pedidos_screen.dart';
import '../settings/settings_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _index;

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<PedidosController>().load();
    });
  }

  static const _screens = <Widget>[
    PedidosScreen(),
    MapScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final pedidosCtrl = context.watch<PedidosController>();

    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: [
          NavigationDestination(
            icon: Badge(
              isLabelVisible: pedidosCtrl.readyCount > 0,
              label: Text('${pedidosCtrl.readyCount}'),
              child: const Icon(Icons.precision_manufacturing_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: pedidosCtrl.readyCount > 0,
              label: Text('${pedidosCtrl.readyCount}'),
              child: const Icon(Icons.precision_manufacturing),
            ),
            label: 'Pedidos',
          ),
          const NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map),
            label: 'Mapa',
          ),
          const NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Ajustes',
          ),
        ],
      ),
    );
  }
}
