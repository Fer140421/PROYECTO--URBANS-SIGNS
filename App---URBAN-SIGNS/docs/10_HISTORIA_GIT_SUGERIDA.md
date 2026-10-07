# Historia Git sugerida

No subas todo en un solo commit. Una historia defendible podría ser:

```text
chore: crear base Flutter y estructura por capas
feat: diseñar login y dashboard Material 3
feat: persistir tema y preferencias locales
feat: integrar autenticacion Supabase
feat: crear modelo y CRUD de incidencias
feat: aplicar RLS y roles de acceso
feat: capturar ubicacion GPS
feat: integrar mapa OpenStreetMap
feat: consumir clima con Open-Meteo
feat: adjuntar evidencia fotografica en Storage
feat: agregar filtros y metricas del dashboard
test: cubrir modelo y repository demo
docs: agregar manuales y evidencia de despliegue
build: preparar APK y AAB de release
```

Antes de cada commit:

```bash
git status
git diff
flutter analyze
flutter test
git add .
git diff --staged
git commit -m "mensaje"
```
