@echo off
cd /d %~dp0\..
if not exist config\live.json (
  echo Falta config\live.json
  echo Copia config\live.example.json y completa URL + publishable key.
  exit /b 1
)
flutter pub get
flutter run --dart-define-from-file=config\live.json
