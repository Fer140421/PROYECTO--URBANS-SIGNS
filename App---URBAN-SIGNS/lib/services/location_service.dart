import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<Position> currentPosition() async {
    final enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) {
      throw StateError('El GPS/servicio de ubicación está desactivado.');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw StateError('Permiso de ubicación denegado.');
    }
    if (permission == LocationPermission.deniedForever) {
      throw StateError(
        'Permiso de ubicación bloqueado permanentemente. Habilítalo en Ajustes.',
      );
    }

    const settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 0,
    );
    return Geolocator.getCurrentPosition(locationSettings: settings);
  }
}
