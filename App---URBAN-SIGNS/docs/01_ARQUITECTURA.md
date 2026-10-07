# Arquitectura explicada sin magia

## Pregunta 1: ¿quién dibuja?

`screens/` y `widgets/`.

## Pregunta 2: ¿quién mantiene el estado?

`controllers/`.

## Pregunta 3: ¿quién decide de dónde salen los reportes?

`IncidentRepository`.

Esto permite tener dos implementaciones:

- `DemoIncidentRepository`: memoria.
- `SupabaseIncidentRepository`: PostgreSQL online.

La pantalla no cambia cuando cambiamos el origen de datos.

## Pregunta 4: ¿quién habla con GPS, clima y cámara?

`services/`.

```text
UI
 ↓
CONTROLLER
 ↓
REPOSITORY / SERVICE
 ↓
DATOS / DISPOSITIVO / INTERNET
```

## Flujo de un reporte

```text
Usuario escribe título
      ↓
IncidentFormScreen
      ↓
GPS → LocationService
      ↓
lat/lng → WeatherService → Open-Meteo
      ↓
foto → ImageService → Supabase Storage
      ↓
Incident
      ↓
IncidentsController
      ↓
IncidentRepository
      ↓
SupabaseIncidentRepository
      ↓
PostgreSQL
```
