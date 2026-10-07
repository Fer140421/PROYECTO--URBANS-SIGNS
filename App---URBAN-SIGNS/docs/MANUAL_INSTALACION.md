# Manual de instalación resumido

## Requisitos

- Flutter estable con Dart >= 3.9.
- Android SDK reciente.
- teléfono Android o emulador.
- Internet.

## Demo

```bash
flutter pub get
flutter run --dart-define-from-file=config/demo.json
```

## Live

1. crear Supabase;
2. ejecutar SQL;
3. crear `config/live.json`;
4. completar URL + publishable key;
5. ejecutar:

```bash
flutter run --dart-define-from-file=config/live.json
```

## Android permisos

La plantilla ya incluye Internet, red, ubicación y cámara en `AndroidManifest.xml`.
