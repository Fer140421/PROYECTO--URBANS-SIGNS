# Plan de integración de vistas responsivas reutilizables

## 1. Objetivo

Crear un estándar reutilizable para los listados y cards de los módulos administrativos, evitando mantener estilos y estructuras responsivas diferentes en cada pantalla.

La integración debe conservar:

- Lógica de negocio y llamadas a servicios.
- Búsquedas, filtros y paginación existentes.
- Acciones de editar, activar, desactivar, eliminar y ver detalles.
- Modales y formularios actuales.
- Directivas de permisos y condiciones `*ngIf`.
- Fotografías, avatares, estados, roles, fechas, importes y contenidos particulares.
- Apariencia aprobada de cada módulo, salvo los ajustes necesarios para adoptar el estándar.

## 2. Principio de diseño

El componente compartido será responsable únicamente de la estructura visual y responsiva. Cada módulo seguirá controlando sus datos, eventos y lógica.

No se debe crear un componente que intente interpretar automáticamente cualquier objeto. En su lugar, se utilizarán plantillas Angular (`ng-template`) proporcionadas por cada módulo.

Responsabilidades globales:

- Alternancia entre lista y cards.
- Contenedor de tabla con desplazamiento horizontal controlado.
- Grid responsivo de cards.
- Espaciado, bordes, sombras y breakpoints.
- Estado vacío y estado de carga.
- Estructura de acciones compactas.
- Accesibilidad básica y tooltips.

Responsabilidades de cada módulo:

- Selección y transformación de datos.
- Contenido de cada columna.
- Contenido interno de cada card.
- Ejecución de acciones.
- Reglas de visibilidad y permisos.
- Filtros, paginación, carga y errores.

## 3. Componentes compartidos propuestos

### 3.1 `ResponsiveDataViewComponent`

Ubicación propuesta:

`src/app/shared/components/responsive-data-view/`

Responsabilidades:

- Recibir el modo de visualización: `'list' | 'cards'`.
- Recibir la colección de elementos.
- Mostrar tabla o grid sin renderizar ambas vistas simultáneamente.
- Mostrar carga y estado vacío.
- Proporcionar puntos de extensión para encabezado, fila y card.

Entradas iniciales propuestas:

```ts
@Input() items: unknown[] = [];
@Input() mode: 'list' | 'cards' = 'list';
@Input() loading = false;
@Input() emptyTitle = 'No hay registros';
@Input() emptyMessage = '';
@Input() loadingLabel = 'Cargando registros';
@Input() cardMinWidth = '280px';
@Input() tableMinWidth?: string;
```

Plantillas proyectadas:

```html
<ng-template appDataHeader>...</ng-template>
<ng-template appDataRow let-item>...</ng-template>
<ng-template appDataCard let-item>...</ng-template>
```

El componente no debe clonar, modificar ni ordenar `items`.

### 3.2 Directivas para plantillas

Directivas propuestas:

- `DataHeaderDirective`
- `DataRowDirective`
- `DataCardDirective`

Su única función será identificar las plantillas recibidas mediante `ContentChild`.

### 3.3 `ActionIconButtonComponent`

Ubicación propuesta:

`src/app/shared/components/action-icon-button/`

Responsabilidades:

- Unificar tamaño, foco, icono y colores de las acciones.
- Mostrar descripción mediante `title` y `aria-label`.
- Emitir el evento de selección sin conocer la lógica del módulo.

Entradas y salida propuestas:

```ts
@Input({ required: true }) label!: string;
@Input({ required: true }) icon!: string;
@Input() variant: 'neutral' | 'primary' | 'warning' | 'danger' | 'success' = 'neutral';
@Input() disabled = false;
@Output() action = new EventEmitter<MouseEvent>();
```

El componente debe conservar un tamaño aproximado de `36 × 36 px` y nunca incluir texto visible en listados compactos.

### 3.4 Clases visuales auxiliares

Definir estilos compartidos con nombres propios, evitando selectores globales demasiado amplios:

- `.data-view`
- `.data-view__table-wrap`
- `.data-view__card-grid`
- `.data-card`
- `.data-card__header`
- `.data-card__body`
- `.data-card__footer`
- `.data-actions`
- `.data-badge`

No usar reglas globales como `.view-surface *` para cambiar todos los descendientes, porque pueden afectar componentes internos, modales o controles especiales.

## 4. Ejemplo de integración

```html
<app-responsive-data-view
  [items]="clientes"
  [mode]="viewMode"
  [loading]="isLoading"
  emptyTitle="No hay clientes">

  <ng-template appDataHeader>
    <tr>
      <th>Cliente</th>
      <th>Tipo</th>
      <th>Estado</th>
      <th class="text-right">Acciones</th>
    </tr>
  </ng-template>

  <ng-template appDataRow let-cliente>
    <tr>
      <td>{{ cliente.nombre }}</td>
      <td>{{ cliente.tipo }}</td>
      <td><!-- badge específico --></td>
      <td><!-- acciones específicas --></td>
    </tr>
  </ng-template>

  <ng-template appDataCard let-cliente>
    <article class="data-card">
      <!-- diseño particular de Cliente -->
    </article>
  </ng-template>
</app-responsive-data-view>
```

Los métodos existentes, por ejemplo `(click)="openEditModal(cliente)"`, permanecen en la plantilla del módulo.

## 5. Estrategia de integración

### Fase 0: establecer una línea base

- Crear una rama dedicada para la integración.
- Registrar capturas de escritorio, tablet y móvil de los módulos que se migrarán.
- Ejecutar `npm run build` antes de realizar cambios.
- Registrar las funcionalidades de cada módulo mediante una lista de verificación.
- No mezclar esta integración con cambios de API, modelos o reglas de negocio.

Resultado esperado: referencia visual y funcional contra la cual comparar cada migración.

### Fase 1: construir la infraestructura compartida

- Crear `ResponsiveDataViewComponent`.
- Crear las tres directivas de plantillas.
- Crear `ActionIconButtonComponent`.
- Añadir estilos encapsulados o clases compartidas específicas.
- Incorporar pruebas unitarias del componente contenedor.
- No migrar todavía ningún módulo productivo.

Pruebas mínimas:

- Renderiza solamente la lista cuando `mode === 'list'`.
- Renderiza solamente los cards cuando `mode === 'cards'`.
- Proyecta correctamente el elemento actual en cada plantilla.
- Muestra carga y estado vacío.
- No renderiza simultáneamente filas y cards.
- El botón de acción emite el evento una sola vez.
- Conserva navegación por teclado y atributos accesibles.

### Fase 2: prueba piloto

Migrar primero un módulo sencillo y de bajo riesgo. Candidato recomendado: Servicios.

Motivos:

- Pocas columnas.
- Card ya aprobado visualmente.
- Acciones simples.
- Permite validar imágenes, estados y botones.

Validar en el piloto:

- Comparación visual antes/después.
- Cambio entre lista y cards.
- Búsqueda y filtro de estado.
- Crear y editar servicio.
- Activar o desactivar servicio.
- Paginación.
- Imágenes ausentes, grandes o con relación de aspecto diferente.
- Textos muy largos.
- Anchos de 320, 375, 768, 1024 y 1440 px.

No comenzar la siguiente fase hasta aprobar el piloto.

### Fase 3: módulos de referencia

Migrar los módulos que actualmente representan el diseño deseado:

1. Empleados.
2. Préstamo de materiales.
3. Solicitud de cotización.

Estos módulos servirán para validar variantes con:

- Fotografías y avatares.
- Muchos atributos.
- Estados y badges.
- Varias acciones.
- Fechas, cantidades y contenido condicional.

### Fase 4: módulos administrativos relacionados

Migrar individualmente y validar después de cada módulo:

1. Usuarios.
2. Asignación de roles.
3. Historial de accesos.
4. Clientes.
5. Proveedores.
6. Roles y permisos, si utiliza el alternador de vistas.

### Fase 5: inventarios y operaciones

Orden sugerido:

1. Inventario de materiales.
2. Inventario de producción.
3. Stock.
4. Compras.
5. Cotizaciones.
6. Pedidos.
7. Facturación.
8. Órdenes de impresión.
9. Seguimiento de trabajos.
10. Los demás listados que utilicen lista/cards.

### Fase 6: limpieza

- Eliminar estructuras duplicadas únicamente después de migrar todos los consumidores.
- Retirar selectores globales antiguos de `.view-surface` de forma gradual.
- Buscar usos restantes con `rg "view-surface|cards-view|list-view" src/app`.
- Eliminar CSS local obsoleto solamente si no tiene consumidores.
- Ejecutar compilación y pruebas completas.
- Actualizar la documentación del proyecto.

## 6. Proceso obligatorio por módulo

Cada módulo debe migrarse en un cambio pequeño y verificable:

1. Identificar datos, acciones y contenido condicional.
2. Registrar el comportamiento actual.
3. Integrar el contenedor compartido.
4. Mantener los métodos TypeScript en el componente original.
5. Implementar las plantillas de encabezado, fila y card.
6. Usar acciones compactas con tooltip.
7. Ejecutar compilación.
8. Probar funcionalidades manualmente.
9. Comparar escritorio y móvil.
10. Aprobar antes de migrar el siguiente módulo.

No migrar múltiples módulos en un único cambio si no existe una prueba automatizada suficiente.

## 7. Matriz de validación funcional

Para cada módulo se debe completar lo siguiente:

| Área | Validación |
|---|---|
| Carga | Los datos aparecen y no se duplican |
| Cambio de vista | Lista y cards muestran los mismos registros |
| Búsqueda | Mantiene resultados y página esperada |
| Filtros | Cada filtro conserva su comportamiento |
| Paginación | Anterior, siguiente y número de página funcionan |
| Acciones | Cada botón ejecuta el método original una sola vez |
| Modales | Abren con el registro correcto y cierran correctamente |
| Permisos | Las acciones restringidas continúan ocultas o deshabilitadas |
| Estado vacío | Se muestra sin tabla o cards residuales |
| Carga | El indicador no muestra simultáneamente datos antiguos |
| Responsive | No existe desbordamiento horizontal en cards |
| Tabla | El desplazamiento horizontal queda limitado al contenedor |
| Accesibilidad | Acciones tienen `title`, `aria-label` y foco visible |

## 8. Casos visuales obligatorios

Probar, como mínimo:

- Nombre o descripción de más de 100 caracteres.
- Correo o identificador sin espacios.
- Registro sin fotografía.
- Registro con muchas etiquetas o roles.
- Card con todas las acciones disponibles.
- Card con acciones ocultas por estado o permiso.
- Lista con una sola fila y con página completa.
- Estado vacío.
- Zoom del navegador al 125 % y 150 %.
- Tema claro y oscuro, si el módulo lo soporta.

## 9. Riesgos y mitigaciones

### Eventos ejecutados más de una vez

Riesgo: renderizar simultáneamente lista y cards o propagar eventos desde un componente de acción.

Mitigación: usar `*ngIf` para renderizar una única vista y detener propagación solamente cuando sea necesario.

### Pérdida del contexto del registro

Riesgo: una plantilla proyectada recibe un elemento incorrecto.

Mitigación: usar `ngTemplateOutletContext` con una interfaz explícita y pruebas con varios registros.

### Ruptura de permisos

Riesgo: mover botones fuera de directivas de permisos existentes.

Mitigación: mantener directivas y condiciones en la plantilla del módulo.

### Cambios visuales involuntarios

Riesgo: selectores globales afectan modales o componentes anidados.

Mitigación: usar clases con alcance específico y evitar selectores universales.

### Tablas demasiado anchas

Riesgo: muchas columnas no caben en móvil.

Mitigación: preservar las columnas y aplicar desplazamiento horizontal solamente al contenedor de tabla. No convertir automáticamente la tabla en cards.

### Cards con alturas diferentes

Riesgo: contenidos variables desalinean las acciones.

Mitigación: card con `display: flex`, cuerpo `flex: 1` y pie separado.

## 10. Estrategia de reversión

- Mantener cada migración en un commit separado por módulo.
- No eliminar la implementación anterior durante el piloto hasta aprobar el resultado.
- Si falla una funcionalidad, revertir únicamente el commit del módulo afectado.
- No modificar contratos de servicios ni modelos como parte de la reversión.
- Conservar capturas y lista de verificación para confirmar que la reversión fue completa.

## 11. Criterios de aceptación globales

La integración se considerará terminada cuando:

- Todos los módulos con alternador usen el mismo contenedor estructural.
- Ningún card se genere transformando una fila de tabla mediante CSS.
- Las tablas mantengan una fila por registro y una columna por atributo definido.
- Los cards tengan encabezado, cuerpo y acciones claramente separados.
- Ningún contenido se salga del card en 320 px de ancho.
- Todas las acciones compactas tengan tooltip y nombre accesible.
- No existan regresiones en filtros, paginación, permisos, modales o servicios.
- `npm run build` finalice correctamente.
- Las advertencias nuevas se documenten o se corrijan antes de integrar.

## 12. Entregables

- Componente `ResponsiveDataViewComponent`.
- Directivas para encabezado, fila y card.
- Componente `ActionIconButtonComponent`.
- Pruebas unitarias de infraestructura.
- Migración piloto de Servicios.
- Migraciones posteriores separadas por módulo.
- Matriz de validación completada.
- Documentación de uso con un ejemplo sencillo y uno avanzado.

## 13. Decisión recomendada

Implementar primero la infraestructura y el piloto en una rama independiente. No realizar una migración masiva. Después de aprobar Servicios en escritorio y móvil, migrar los módulos por grupos pequeños, conservando en cada uno su lógica TypeScript y sus plantillas específicas de contenido.
