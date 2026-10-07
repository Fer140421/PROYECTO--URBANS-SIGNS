# Matriz de competencias · GeoRescue 360 PRO

Esta matriz sirve para explicar por qué cada pieza existe y qué demuestra en una defensa.

| Funcionalidad | Tecnología | Qué demuestra |
|---|---|---|
| UI responsive / Material 3 | Flutter | Diseño, widgets, experiencia móvil |
| Navegación | go_router | Flujo de pantallas y paso de contexto |
| Estado global | Provider | Separación entre UI y estado |
| Preferencias | SharedPreferencesAsync | Persistencia local sencilla |
| Login / registro / sesión | Supabase Auth | Identidad y sesión de usuario |
| Perfil + roles | PostgreSQL + RLS | Autorización y reglas de acceso |
| CRUD de incidencias | Supabase PostgreSQL | Persistencia remota real |
| GPS | geolocator | Acceso a hardware / servicios nativos |
| Mapa | flutter_map + OSM | Datos geoespaciales y visualización |
| Cámara / galería | image_picker | Evidencia capturada desde el dispositivo |
| Fotografías | Supabase Storage | Manejo de archivos remotos |
| Clima contextual | HTTP + Open-Meteo | API REST, JSON, async/await |
| Loading / error / retry | Flutter | Estados asíncronos y resiliencia UX |
| Búsqueda y filtros | Dart / Flutter | Lógica de presentación |
| Métricas | Controller | Transformación de datos para dashboard |
| Pruebas | flutter_test | Calidad verificable |
| Git / GitHub | Git | Evolución progresiva y trazabilidad |
| APK / AAB | Flutter / Android | Empaquetado y distribución |

## Qué hace que sea un ejemplo PRO

No es la cantidad de paquetes. Es la integración coherente de un flujo completo:

```text
USUARIO
  ↓
AUTENTICACIÓN
  ↓
FORMULARIO VALIDADO
  ↓
GPS + FOTO + API
  ↓
REPOSITORY
  ↓
POSTGRESQL + STORAGE + RLS
  ↓
MAPA / DASHBOARD / DETALLE
  ↓
PRUEBAS + GIT + BUILD
```

## Qué NO debe copiar un estudiante literalmente

El dominio `incidencias georreferenciadas` es un ejemplo. El estudiante debe cambiar problema, actores, entidades, reglas de negocio, validaciones, pantallas, pruebas y evidencias según su propio Trabajo Final.
