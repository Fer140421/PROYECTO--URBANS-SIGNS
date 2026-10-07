#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -f config/live.json ]]; then
  echo "Falta config/live.json"
  echo "Copia config/live.example.json y completa URL + publishable key."
  exit 1
fi
flutter pub get
flutter run --dart-define-from-file=config/live.json
