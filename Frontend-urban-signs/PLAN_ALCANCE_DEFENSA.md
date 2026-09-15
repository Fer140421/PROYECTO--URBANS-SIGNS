# Plan de alcance para la defensa de grado

## Enfoque recomendado

Para la defensa es preferible demostrar un flujo completo, consistente y probado antes que presentar muchos módulos parcialmente desarrollados.

En lugar de describir la aplicación como un ERP completo, se recomienda presentarla como:

> Sistema de gestión del proceso comercial y operativo para una empresa de producción gráfica.

Este enfoque representa mejor las funciones principales del sistema y permite explicar claramente el problema que resuelve.

## Flujo principal del sistema

```text
Cliente
  → Solicitud
  → Cotización
  → Aprobación
  → Pedido
  → Orden de impresión
  → Planificación y seguimiento
  → Finalización y entrega
  → Reportes
```

Módulos de apoyo:

```text
Empleados, usuarios y permisos
Servicios
Activos y herramientas
Préstamos de herramientas
```

## Módulos que se recomienda conservar

- Empleados, usuarios, roles y permisos.
- Clientes.
- Servicios.
- Solicitudes.
- Cotizaciones.
- Pedidos.
- Órdenes de impresión.
- Seguimiento de trabajos.
- Reportes.
- Activos y herramientas.
- Préstamos.

## Módulos que se recomienda ocultar temporalmente

- Compras.
- Proveedores.
- Inventario de materiales de producción.
- Stock de materias primas.
- Lotes.
- Categorías de materiales.
- Sobrantes o residuos reutilizables.
- Unidades de medida.
- Facturación, si todavía no está completamente integrada.

No se recomienda borrar ni comentar grandes bloques de código. Es más limpio:

- Retirar estos módulos del sidebar.
- Desactivar sus rutas mientras estén fuera del alcance.
- Conservar sus componentes y servicios en el repositorio.
- Crear una rama Git antes de reducir el alcance.
- Documentarlos como posibles ampliaciones futuras.

## Dependencias importantes encontradas

### Cotizaciones y materiales de producción

El registro y la modificación de cotizaciones consultan `MaterialProduccionService`. Los materiales forman parte del cálculo y detalle de los trabajos cotizados.

Por eso no se debe eliminar completamente el catálogo de materiales. Hay dos alternativas:

1. Mantener un catálogo mínimo de materiales, pero ocultar su administración en el menú.
2. Simplificar las cotizaciones para trabajar únicamente con servicio, cantidad y precio unitario.

Se recomienda la primera alternativa: precargar materiales de demostración y permitir que Cotizaciones los consulte, aunque el módulo de inventario no sea visible durante la defensa.

### Préstamos y activos

El módulo de préstamos utiliza el servicio de herramientas o materiales de trabajo. Por tanto:

- Se debe mantener el inventario de activos y herramientas.
- Se debe mantener el módulo de préstamos.
- Se puede renombrar el módulo como **Activos y herramientas**.
- No es necesario conservar Compras, Proveedores, Stock, Lotes ni Materias primas para este flujo.

### Categorías y Pedidos

El módulo de Pedidos importa `CategoryService` y contiene lógica de formularios de categorías que aparentemente no corresponde a la responsabilidad de Pedidos. Esto puede ser código residual o una mezcla de responsabilidades.

Antes de la defensa conviene limpiar esa lógica para que Pedidos se encargue únicamente de la gestión de pedidos.

## Funcionalidades necesarias por módulo

### 1. Empleados y seguridad

- Registrar, modificar, consultar y desactivar empleados.
- Almacenar y mostrar correctamente la fotografía.
- Vincular usuarios con empleados.
- Administrar roles y permisos.
- Validar duplicados de CI, teléfono y correo.
- Bloquear credenciales al desactivar un empleado.
- Registrar quién creó o modificó cada elemento importante.

### 2. Clientes

- Registrar y modificar clientes.
- Diferenciar personas y empresas.
- Buscar por nombre, documento o teléfono.
- Consultar solicitudes, cotizaciones y pedidos relacionados.
- Evitar registros duplicados.
- Desactivar clientes sin eliminar su historial.

Una vista con el historial completo del cliente daría mayor solidez al proyecto.

### 3. Servicios

- Nombre.
- Descripción.
- Fotografía.
- Estado activo o inactivo.
- Precio base o criterio de cálculo, cuando corresponda.
- Integración real con Solicitudes y Cotizaciones.

### 4. Solicitudes

- Cliente relacionado.
- Uno o varios servicios solicitados.
- Cantidades y dimensiones.
- Observaciones.
- Archivos o imágenes de referencia.
- Fecha de registro.
- Estados claros: pendiente, cotizada y cancelada.
- Restricciones de modificación después de cotizar.
- Historial de cambios.

### 5. Cotizaciones

- Recuperar datos de la solicitud.
- Incluir servicios y cantidades.
- Incluir materiales utilizados, aunque su catálogo no sea visible.
- Registrar mano de obra u otros costos.
- Calcular precios unitarios y totales.
- Manejar fecha de emisión y vencimiento.
- Estados: pendiente, aprobada, rechazada y vencida.
- Generar PDF.
- Aprobar o rechazar la cotización.
- Controlar múltiples cotizaciones para una misma solicitud.
- Convertir una cotización aprobada en pedido.
- Mantener cálculos consistentes entre frontend y backend.

El backend debe confirmar los totales; no debería confiar únicamente en cálculos enviados desde el navegador.

### 6. Pedidos

Un pedido debe nacer de una cotización aprobada y contener:

- Código único.
- Cliente y cotización de origen.
- Fecha comprometida.
- Estado.
- Detalle de los trabajos.
- Historial de estados.
- Relaciones visibles con la solicitud, cotización y órdenes de impresión.
- Restricciones para impedir cambios de estado incoherentes.

Máquina de estados sugerida:

```text
PENDIENTE → EN_PROCESO → TERMINADO → ENTREGADO
                    ↘ CANCELADO
```

### 7. Órdenes de impresión

- Pedido relacionado.
- Responsable que emite la orden.
- Archivo de producción.
- Fecha de emisión.
- Fecha de recepción.
- Estado.
- Observaciones.
- Descarga del archivo.
- Reemplazo controlado del archivo.
- Registro de quién recibió o procesó la orden.
- Restricción para pedidos cancelados o finalizados.

### 8. Seguimiento de trabajos

- Pedidos pendientes.
- Trabajos programados.
- Empleado responsable.
- Fecha de inicio y fecha estimada.
- Progreso o estado.
- Identificación de retrasos.
- Observaciones.
- Evidencia de finalización.
- Historial de cambios.
- Vista semanal o tablero.

El seguimiento debe actualizar el estado real del pedido y no funcionar como una pantalla aislada.

### 9. Activos y préstamos

- Herramienta o activo.
- Estado y disponibilidad.
- Empleado responsable.
- Fecha y hora del préstamo.
- Fecha prevista de devolución.
- Fecha real de devolución.
- Condición de salida y retorno.
- Identificación de préstamos vencidos.
- Restricción para no prestar una herramienta ocupada.
- Historial por empleado y herramienta.

### 10. Reportes

Los reportes deberían responder preguntas concretas:

- Solicitudes recibidas por período.
- Cotizaciones aprobadas, rechazadas y vencidas.
- Tasa de conversión de solicitudes en pedidos.
- Pedidos agrupados por estado.
- Pedidos entregados y retrasados.
- Trabajos asignados por empleado.
- Tiempo promedio de ejecución.
- Servicios más solicitados.
- Préstamos activos y vencidos.
- Clientes con mayor cantidad de solicitudes o pedidos.

También deberían incluir:

- Filtros por fechas.
- Totales consistentes.
- Gráficos basados en datos reales.
- Exportación a PDF o Excel, si es viable dentro del alcance.

Es preferible presentar seis indicadores confiables antes que veinte gráficos decorativos.

## Prioridades de trabajo para la defensa

1. Asegurar el flujo completo desde Solicitud hasta Entrega.
2. Corregir reglas de estados y relaciones entre módulos.
3. Completar el Seguimiento de trabajos.
4. Mejorar los Reportes con información real.
5. Terminar seguridad, permisos y validaciones.
6. Completar Activos y Préstamos.
7. Ocultar los módulos fuera del alcance.
8. Preparar datos de demostración y un guion para la defensa.
9. Probar el flujo completo con diferentes roles.
10. Corregir errores visuales, mensajes y estados de carga.

## Conclusión

Reducir el alcance es una decisión adecuada. El proyecto será más defendible si presenta menos módulos, pero con mayor profundidad, trazabilidad y consistencia.

Se debe conservar internamente un catálogo mínimo de materiales porque Cotizaciones depende actualmente de él. El objetivo es ocultar la administración del inventario de materias primas, sin romper el cálculo ni el registro de cotizaciones.

El valor principal de la solución debe concentrarse en demostrar un proceso integrado y funcional:

```text
Solicitud → Cotización → Pedido → Producción → Seguimiento → Entrega → Reportes
```
