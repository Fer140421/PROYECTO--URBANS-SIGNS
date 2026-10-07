#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
CONFIG="config/live.json"
if [[ ! -f "$CONFIG" ]]; then
  echo "No existe $CONFIG. No se construirá una release LIVE."
  exit 1
fi
flutter clean
flutter pub get
flutter analyze
flutter test
flutter build apk --release --dart-define-from-file="$CONFIG"
flutter build appbundle --release --dart-define-from-file="$CONFIG"
echo "APK: build/app/outputs/flutter-apk/app-release.apk"
echo "AAB: build/app/outputs/bundle/release/app-release.aab (ruta puede variar ligeramente según Flutter)"
