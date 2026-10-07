# Demo magistral · 10 minutos

Objetivo: mostrar en una defensa que la aplicación no es una maqueta, sino un sistema móvil completo.

## Minuto 0–1 · Problema

"GeoRescue 360 convierte un reporte ciudadano en una evidencia georreferenciada, trazable y consultable. Es un proyecto académico y no sustituye canales oficiales de emergencia."

## Minuto 1–2 · Acceso

- iniciar sesión;
- mostrar que existe identidad de usuario;
- indicar que un administrador tiene permisos adicionales.

## Minuto 2–5 · Reporte WOW

1. crear reporte;
2. tomar GPS real;
3. consultar clima;
4. adjuntar foto;
5. guardar.

Mientras se guarda, explicar:

```text
Flutter → Repository → Supabase PostgreSQL / Storage
```

## Minuto 5–6 · Base real

Abrir Supabase y mostrar la fila recién creada. Mostrar también el archivo de evidencia en Storage.

## Minuto 6–7 · Mapa

Abrir mapa y tocar el marcador del reporte. Explicar que latitud/longitud provienen del dispositivo.

## Minuto 7–8 · CRUD

Editar el estado del reporte y luego mostrar que el cambio reaparece desde la base.

## Minuto 8–9 · Seguridad

Mostrar RLS y explicar:
- sólo autenticados crean;
- el dueño o admin modifica/elimina;
- la clave `service_role` nunca vive en el cliente.

## Minuto 9–10 · Ingeniería

Mostrar:
- arquitectura;
- tests;
- `git log --oneline --graph`;
- APK/AAB.

Cierre:

> "No estoy mostrando pantallas aisladas. Estoy mostrando un flujo completo: usuario, hardware, API, datos, seguridad, evidencia y distribución."
