#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== GEORESCUE 360 · PREFLIGHT =="
flutter --version
flutter doctor
flutter devices
flutter pub get
flutter analyze
flutter test
echo
printf 'OK. Ahora ejecuta: ./scripts/run_demo_linux.sh\n'
