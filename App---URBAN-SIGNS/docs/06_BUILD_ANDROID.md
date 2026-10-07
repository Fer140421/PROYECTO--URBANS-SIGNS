# Build Android

## Antes del build

```bash
flutter doctor
flutter pub get
flutter analyze
flutter test
```

## APK de prueba release

```bash
flutter build apk --release --dart-define-from-file=config/live.json
```

## AAB para Play Store

```bash
flutter build appbundle --release --dart-define-from-file=config/live.json
```

## Firma

El `build.gradle.kts` incluido lee `android/key.properties` si existe. Sin ese archivo usa firma debug para facilitar el laboratorio; eso NO es suficiente para una publicación real.

Para publicación final:

1. genera un keystore privado;
2. crea `android/key.properties`;
3. no subas el keystore ni las contraseñas al repositorio;
4. conserva copias seguras;
5. genera AAB firmado;
6. prueba el build antes de entregar.

## Ejemplo de `android/key.properties`

Usa `android/key.properties.example` como plantilla:

```properties
storePassword=...
keyPassword=...
keyAlias=upload
storeFile=/ruta/privada/georescue-upload-key.jks
```

Regla: el archivo real y el keystore son privados y ya están cubiertos por `.gitignore`.
