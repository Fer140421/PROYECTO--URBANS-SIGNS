@echo off
cd /d %~dp0\..
echo == GEORESCUE 360 - PREFLIGHT ==
flutter --version
flutter doctor
flutter devices
flutter pub get
flutter analyze
flutter test
