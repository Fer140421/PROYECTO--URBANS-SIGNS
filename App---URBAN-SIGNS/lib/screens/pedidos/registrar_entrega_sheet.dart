import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../controllers/pedidos_controller.dart';
import '../../models/pedido.dart';
import '../../services/image_service.dart';
import '../../services/location_service.dart';

class RegistrarEntregaSheet extends StatefulWidget {
  const RegistrarEntregaSheet({
    super.key,
    required this.pedido,
  });

  final Pedido pedido;

  static Future<bool?> show(BuildContext context, Pedido pedido) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF141718),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => RegistrarEntregaSheet(pedido: pedido),
    );
  }

  @override
  State<RegistrarEntregaSheet> createState() => _RegistrarEntregaSheetState();
}

class _RegistrarEntregaSheetState extends State<RegistrarEntregaSheet> {
  final _observacionCtrl = TextEditingController();
  final _montoCtrl = TextEditingController();

  XFile? _foto;
  Position? _posicion;
  bool _obteniendoGps = false;
  String? _gpsError;

  bool _registrarCobro = false;
  String _metodoPago = 'EFECTIVO';
  bool _enviando = false;

  @override
  void initState() {
    super.initState();
    if (widget.pedido.tieneSaldoPendiente) {
      _registrarCobro = true;
      _montoCtrl.text = widget.pedido.saldoPendiente.toStringAsFixed(2);
    }
    _obtenerUbicacion();
  }

  @override
  void dispose() {
    _observacionCtrl.dispose();
    _montoCtrl.dispose();
    super.dispose();
  }

  Future<void> _obtenerUbicacion() async {
    setState(() {
      _obteniendoGps = true;
      _gpsError = null;
    });

    try {
      final locService = context.read<LocationService>();
      final pos = await locService.currentPosition();
      if (mounted) {
        setState(() {
          _posicion = pos;
          _obteniendoGps = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _gpsError = e.toString().replaceAll('Exception: ', '').replaceAll('StateError: ', '');
          _obteniendoGps = false;
        });
      }
    }
  }

  Future<void> _capturarFoto(ImageSource source) async {
    final imageService = context.read<ImageService>();
    try {
      final image = source == ImageSource.camera
          ? await imageService.pickCamera()
          : await imageService.pickGallery();

      if (image != null && mounted) {
        setState(() => _foto = image);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al capturar imagen: $e')),
        );
      }
    }
  }

  Future<void> _confirmarEntrega() async {
    if (_foto == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Es obligatorio tomar la fotografía de evidencia de la entrega/instalación.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _enviando = true);

    try {
      final controller = context.read<PedidosController>();
      double? monto;
      if (_registrarCobro && _montoCtrl.text.isNotEmpty) {
        monto = double.tryParse(_montoCtrl.text.trim());
      }

      await controller.registrarEntrega(
        idPedido: widget.pedido.idPedido,
        foto: _foto,
        latitud: _posicion?.latitude ?? widget.pedido.latitud,
        longitud: _posicion?.longitude ?? widget.pedido.longitud,
        observacion: _observacionCtrl.text.trim().isNotEmpty ? _observacionCtrl.text.trim() : 'Entrega física completada.',
        monto: monto,
        metodoPago: _registrarCobro ? _metodoPago : null,
      );

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ ¡Entrega física con evidencia fotográfica registrada exitosamente!'),
            backgroundColor: Color(0xFF00E676),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _enviando = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al enviar entrega: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: 'Bs. ', decimalDigits: 2);
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Asa de arrastre
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Título
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Registrar Entrega / Colocación',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Pedido #${widget.pedido.idPedido} · ${widget.pedido.nombreCliente}',
                        style: const TextStyle(color: Color(0xFFFFC400), fontSize: 13, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 1. Evidencia Fotográfica (Cámara / Galería)
            const Text(
              '1. FOTOGRAFÍA DE EVIDENCIA (OBLIGATORIA)',
              style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),

            if (_foto == null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2223),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF333A3C), style: BorderStyle.solid),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.camera_alt_outlined, size: 48, color: Color(0xFFFFC400)),
                    const SizedBox(height: 10),
                    const Text(
                      'Toma una fotografía del letrero instalado o entregado',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFFD2D7D7), fontSize: 13),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        FilledButton.icon(
                          onPressed: () => _capturarFoto(ImageSource.camera),
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFFFFC400),
                            foregroundColor: Colors.black,
                          ),
                          icon: const Icon(Icons.photo_camera, size: 18),
                          label: const Text('Tomar Foto', style: TextStyle(fontWeight: FontWeight.w900)),
                        ),
                        const SizedBox(width: 10),
                        OutlinedButton.icon(
                          onPressed: () => _capturarFoto(ImageSource.gallery),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Color(0xFF4A5254)),
                          ),
                          icon: const Icon(Icons.photo_library, size: 18),
                          label: const Text('Galería'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ] else ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    SizedBox(
                      height: 190,
                      width: double.infinity,
                      child: kIsWeb
                          ? Image.network(_foto!.path, fit: BoxFit.cover)
                          : Image.file(File(_foto!.path), fit: BoxFit.cover),
                    ),
                    Container(
                      margin: const EdgeInsets.all(10),
                      child: FilledButton.tonalIcon(
                        onPressed: () => _capturarFoto(ImageSource.camera),
                        style: FilledButton.styleFrom(backgroundColor: Colors.black87),
                        icon: const Icon(Icons.refresh, size: 16, color: Color(0xFFFFC400)),
                        label: const Text('Cambiar Foto', style: TextStyle(color: Colors.white, fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // 2. Georreferenciación GPS
            const Text(
              '2. UBICACIÓN GPS DEL MONTAJE',
              style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E2223),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF2E3537)),
              ),
              child: Row(
                children: [
                  Icon(
                    _posicion != null ? Icons.my_location : Icons.location_searching,
                    color: _posicion != null ? const Color(0xFF00E676) : const Color(0xFFFFC400),
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_obteniendoGps) ...[
                          const Text('Detectando coordenadas satelitales...', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ] else if (_posicion != null) ...[
                          Text(
                            'Lat: ${_posicion!.latitude.toStringAsFixed(6)}, Lng: ${_posicion!.longitude.toStringAsFixed(6)}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5),
                          ),
                          const Text('Ubicación capturada con éxito', style: TextStyle(color: Color(0xFF00E676), fontSize: 11)),
                        ] else ...[
                          Text(_gpsError ?? 'Sin coordenadas GPS', style: const TextStyle(color: Colors.orange, fontSize: 12)),
                        ],
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _obteniendoGps ? null : _obtenerUbicacion,
                    icon: const Icon(Icons.refresh, size: 20, color: Color(0xFFFFC400)),
                    tooltip: 'Recalcular GPS',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Cobro de Saldo Pendiente (Opcional)
            if (widget.pedido.tieneSaldoPendiente) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2223),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _registrarCobro ? const Color(0xFFFFC400).withValues(alpha: 0.5) : const Color(0xFF2E3537),
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _registrarCobro,
                          activeColor: const Color(0xFFFFC400),
                          checkColor: Colors.black,
                          onChanged: (val) => setState(() => _registrarCobro = val ?? false),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _registrarCobro = !_registrarCobro),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Cobrar saldo pendiente al cliente',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  'Monto adeudado: ${currency.format(widget.pedido.saldoPendiente)}',
                                  style: const TextStyle(color: Color(0xFFFFC400), fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (_registrarCobro) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: TextFormField(
                              controller: _montoCtrl,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              decoration: const InputDecoration(
                                labelText: 'Monto Cobrado (Bs.)',
                                prefixText: 'Bs. ',
                                isDense: true,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            flex: 3,
                            child: DropdownButtonFormField<String>(
                              initialValue: _metodoPago,
                              dropdownColor: const Color(0xFF1E2223),
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: const InputDecoration(
                                labelText: 'Método',
                                isDense: true,
                              ),
                              items: const [
                                DropdownMenuItem(value: 'EFECTIVO', child: Text('Efectivo')),
                                DropdownMenuItem(value: 'QR', child: Text('QR')),
                                DropdownMenuItem(value: 'TRANSFERENCIA', child: Text('Transfer.')),
                              ],
                              onChanged: (val) {
                                if (val != null) setState(() => _metodoPago = val);
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4. Observaciones
            const Text(
              '3. OBSERVACIONES DEL MONTAJE (OPCIONAL)',
              style: TextStyle(color: Color(0xFFA0A7A7), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _observacionCtrl,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Ej. Instalado en segundo piso con anclajes metálicos, cliente satisfecho.',
              ),
            ),
            const SizedBox(height: 20),

            // Botón de Envío
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton.icon(
                onPressed: _enviando ? null : _confirmarEntrega,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFFFC400),
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _enviando
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const Icon(Icons.check_circle_outline, size: 20),
                label: Text(
                  _enviando ? 'Subiendo Evidencia...' : 'Confirmar y Finalizar Entrega',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
