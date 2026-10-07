# Cómo transformar GeoRescue 360 en otro Trabajo Final

La arquitectura se reutiliza; el dominio cambia.

| GeoRescue | Hotel | Veterinaria | Mantenimiento |
|---|---|---|---|
| Incident | Reservation | Pet | WorkOrder |
| categoría | servicio | especie | tipo de falla |
| severidad | prioridad | estado clínico | criticidad |
| GPS | ubicación hotel | ubicación rescate | ubicación equipo |
| foto evidencia | comprobante | foto mascota | foto avería |

## No copiar nombres

Un Trabajo Final propio debe redefinir:

- problema
- actores
- entidad principal
- campos
- reglas
- pantallas
- permisos
- API externa
- capacidad nativa
- pruebas
- identidad visual

## Qué sí puedes conservar

- separación por capas
- patrón Repository
- gestión de estado
- manejo loading/error
- configuración segura
- proceso Git
- estructura de pruebas
- proceso de build
