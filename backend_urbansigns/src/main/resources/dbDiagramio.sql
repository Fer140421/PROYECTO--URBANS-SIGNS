// =========================================================================
// URBAN SIGNS SRL - DIAGRAMA DE BASE DE DATOS (dbdiagram.io / DBML)
// Refleja todas las tablas del sistema, flujo operativo, inventario y seguridad
// =========================================================================

Table personas {
  id_persona serial [pk, not null]
  ci varchar(15) [unique, not null]
  nombre varchar(20) [not null]
  apellido_paterno varchar(20)
  apellido_materno varchar(20)
  numero_telefono varchar(20) [not null]
}

Table roles {
  id_rol serial [pk, not null]
  nombre_rol varchar(30) [not null]
  estado boolean [default: true, not null]
}

Table usuarios {
  id_usuario serial [pk, not null]
  id_persona integer [unique, not null]
  usuario_acceso varchar(20) [unique, not null]
  contrasena_acceso varchar(50) [not null]
  estado_usuario boolean [default: true, not null]
}

Table usuarios_roles {
  id_rol integer [not null]
  id_usuario integer [not null]
  fecha_asignacion timestamp [default: `now()`]
  
  Indexes {
    (id_rol, id_usuario) [pk]
  }
}

Table empleado {
  id_empleado int [pk]
  id_persona int
  fecha_contratacion date [default: `CURRENT_DATE`]
  foto varchar(255)
  salario decimal
  estado boolean [default: true]
}

Table sesion {
  id_sesion serial [pk]
  id_usuario int [not null]
  login_inicio timestamp [default: `CURRENT_TIMESTAMP`, not null]
  login_fin timestamp
  ip_direccion varchar(255)
  dispositivo varchar(255)
  estado sesion_estado [default: 'ACTIVO']
}

Table sesion_accion {
  id_accion serial [pk]
  id_sesion int [not null]
  descripcion text
  modulo varchar(100)
  fecha_accion timestamp [default: `CURRENT_TIMESTAMP`, not null]
}

Table refresh_token {
  id_refresh_token bigserial [pk]
  id_sesion int [not null]
  token_hash varchar(64) [unique, not null]
  creado_en timestamp [default: `CURRENT_TIMESTAMP`, not null]
  expira_en timestamp [not null]
  usado_en timestamp
  revocado_en timestamp
  reemplazado_por bigint
}

Table proveedores {
  id_proveedor serial [pk]
  id_persona int [not null]
  ciudad varchar(100)
  estado boolean [default: true]
}

Table categorias {
  id_categoria serial [pk]
  nombre varchar(50) [not null]
  descripcion varchar(50)
  estado boolean [default: true, not null]
}

Table herramientas {
  id_herramienta serial [pk]
  codigo varchar(100) [unique, not null]
  nombre varchar(100) [not null]
  marca varchar(100)
  modelo varchar(100)
  foto varchar(255)
  estado_actual estado_herramienta_enum [default: 'DISPONIBLE']
  ubicacion varchar(100)
  fecha_ingreso date [default: `CURRENT_DATE`]
  observaciones text
  activo boolean [default: true]
}

Table movimiento_herramientas {
  id_movimiento serial [pk]
  id_herramienta int [not null]
  tipo_movimiento tipo_movimiento_herramienta_enum [not null]
  responsable int
  descripcion text
  fecha timestamp [default: `CURRENT_TIMESTAMP`]
}

Table unidades_medida {
  id_unidad serial [pk]
  nombre varchar(50) [unique, not null]
  abreviatura varchar(10) [unique, not null]
  estado boolean [default: true, not null]
}

Table material_produccion {
  id_material serial [pk]
  id_categoria int [not null]
  id_unidad int [not null]
  nombre varchar(100) [not null]
  caracteristica varchar(50)
  color varchar(50)
  fecha_creacion date [default: `CURRENT_DATE`, not null]
  foto varchar(255)
  estado boolean [default: true]
  tipo_control tipo_control_enum [default: 'UNIDAD', not null]
  ancho_rollo numeric(10,3)
  largo_rollo_nuevo numeric(10,2)
  ancho_plancha numeric(10,3)
  alto_plancha numeric(10,3)
  m2_por_plancha numeric(10,4)
  stock_minimo numeric(10,3) [default: 0, not null]
  porcentaje_desperdicio numeric(5,2) [default: 10.00]
}

Table lotes_material {
  id_lote serial [pk]
  id_material int [not null]
  codigo_lote varchar(50) [unique, not null]
  id_compra int
  fecha_ingreso timestamp [default: `CURRENT_TIMESTAMP`, not null]
  cantidad_inicial numeric(10,3) [not null]
  cantidad_actual numeric(10,3) [not null]
  ancho_rollo numeric(10,3)
  metros_lineales_actuales numeric(10,2)
  ubicacion varchar(100)
  activo boolean [default: true]
}

Table compras {
  id_compra serial [pk]
  id_proveedor int [not null]
  fecha timestamp [default: `CURRENT_TIMESTAMP`, not null]
  estado estado_compra [default: 'Pendiente', not null]
  total numeric(10,2) [not null]
  observaciones text
}

Table detalle_compras {
  id_detalle_compra serial [pk]
  id_compra int [not null]
  id_material int [not null]
  cantidad numeric(10,3) [not null]
  precio_unitario numeric(10,2) [not null]
  subtotal numeric(10,2) [not null]
}

Table entradas {
  id_entrada serial [pk]
  id_material int [not null]
  id_lote int
  responsable int [not null]
  cantidad numeric(10,3) [not null]
  fecha timestamp [default: `CURRENT_TIMESTAMP`, not null]
  observaciones text
}

Table movimiento_stock {
  id_movimiento_stock serial [pk]
  id_material int [not null]
  id_lote int
  id_compra int
  id_entrada int
  id_usuario int [not null]
  cantidad numeric(10,3) [not null]
  tipo_movimiento tipo_movimiento_enum [not null]
  fecha timestamp [default: `CURRENT_TIMESTAMP`]
  id_trabajo int
  cliente varchar(100)
  descripcion text
}

Table residuos_material {
  id_residuo serial [pk]
  id_material int [not null]
  id_lote_origen int
  cantidad numeric(10,3) [not null]
  unidad varchar(20) [not null]
  ubicacion varchar(100)
  estado estado_residuo_enum [default: 'DISPONIBLE']
  fecha_registro timestamp [default: `CURRENT_TIMESTAMP`]
  observaciones text
}

Table empresas {
  id_empresa serial [pk]
  razon_social varchar(150) [not null]
  nit varchar(20) [unique, not null]
  direccion text
  telefono varchar(20)
}

Table clientes {
  id_cliente serial [pk]
  id_persona int [unique]
  id_empresa int [unique]
  id_usuario int [unique]
  tipo_cliente_persona_empresa varchar(10) [not null, note: 'Persona o Empresa; exactamente uno entre id_persona e id_empresa debe tener valor']
  tipo_cliente varchar(15)
  estado boolean [default: true, not null]
  fecha_registro date [default: `CURRENT_DATE`, not null]
  correo varchar(255)
}

Table trabajos {
  id_trabajo serial [pk]
  foto varchar(255) [not null]
  nombre varchar(100) [not null]
  descripcion text [not null]
  estado boolean [default: true]
}

Table solicitud_cotizacion {
  id_solicitud serial [pk]
  cod_solicitud varchar(50) [unique, not null]
  id_cliente int [not null]
  fecha_solicitud date [default: `CURRENT_DATE`]
  estado varchar(20) [default: 'PENDIENTE']
  observaciones text
}

Table solicitud_trabajo {
  id_solicitud_trabajo serial [pk]
  id_solicitud int [not null]
  id_trabajo int [not null]
  cantidad int [default: 1]
  base decimal(10,2)
  altura decimal(10,2)
  area_total decimal(10,2)
  descripcion text
}

Table cotizaciones {
  id_cotizacion serial [pk]
  cod_cotizacion varchar(50) [unique, not null]
  id_solicitud int [not null]
  fecha_emision date [default: `CURRENT_DATE`]
  fecha_caducado date
  costo_total decimal(12,2) [default: 0]
  estado varchar(20) [default: 'PENDIENTE']
}

Table cotizacion_trabajo {
  id_cotizacion_trabajo serial [pk]
  id_cotizacion int [not null]
  id_solicitud_trabajo int [not null]
  cantidad integer [not null]
  costo_unitario decimal(12,2)
  subtotal decimal(12,2)
}

Table detalle_cotizacion {
  id_detalle_cotizacion serial [pk]
  id_cotizacion_trabajo int [not null]
  id_material int [not null]
}

Table pedidos {
  id_pedido serial [pk]
  id_cotizacion int [not null]
  id_cliente int [not null]
  fecha_pedido date [default: `CURRENT_DATE`]
  estado_pedido varchar(20) [default: 'PENDIENTE']
  estado_pago varchar(20) [default: 'SIN_PAGAR']
  anticipo decimal(12,2) [default: 0]
  saldo_pendiente decimal(12,2) [default: 0]
  facturado boolean [default: false]
  total decimal(12,2) [default: 0]
  fecha_entrega_real timestamp
  foto_evidencia varchar(500)
  observacion_entrega text
  entregado_por bigint
  latitud_entrega decimal(10,8)
  longitud_entrega decimal(11,8)
}

Table pagos_pedido {
  id_pago serial [pk]
  id_pedido int [not null]
  fecha_pago date [default: `CURRENT_DATE`]
  monto decimal(12,2) [not null]
  metodo_pago varchar(30)
  observacion text
}

Table orden_impresion {
  id_orden serial [pk]
  nro_orden varchar(50) [unique, not null]
  id_pedido int [not null]
  fecha_emision timestamp [default: `CURRENT_TIMESTAMP`]
  responsable int
  observaciones text
  archivo_adjunto text
  estado varchar(20) [default: 'PENDIENTE']
}

Table detalle_orden_impresion {
  id_orden_trabajo serial [pk]
  id_orden int [not null]
  id_cotizacion_trabajo int [not null]
  observaciones text
}

Table prestamos_material_trabajo {
  id_prestamo bigint [pk]
  id_empleado bigint [not null]
  id_pedido bigint
  fecha_prestamo timestamp [default: `CURRENT_TIMESTAMP`, not null]
  fecha_devolucion timestamp
  tipo_prestamo tipo_prestamo_enum [default: 'DIARIO', not null]
  observacion text
  estado varchar(10) [not null]
}

Table detalle_prestamo {
  id_detalle_prestamo bigint [pk]
  id_prestamo bigint [not null]
  id_herramienta bigint [not null]
}

Table planificacion_semanal {
  id_planificacion serial [pk]
  fecha_inicio date [not null]
  fecha_fin date [not null]
  creado_por int
  fecha_creacion timestamp [default: `CURRENT_TIMESTAMP`]
  observaciones text
}

Table trabajo_programado {
  id_trabajo_programado serial [pk]
  id_planificacion int [not null]
  id_pedido int
  id_orden_impresion int
  cliente varchar(255)
  descripcion_trabajo text [not null]
  area_trabajo varchar(100)
  direccion text
  id_trabajador_asignado bigint
  trabajador varchar(255)
  fecha_programada date [not null]
  hora_programada time
  estado varchar(20) [default: 'PENDIENTE']
  cumplido boolean
  observaciones text
  fecha_creacion timestamp [default: `CURRENT_TIMESTAMP`]
  ultima_modificacion timestamp [default: `CURRENT_TIMESTAMP`]
}

Table reprogramacion_trabajo {
  id_reprogramacion serial [pk]
  id_trabajo_programado int [not null]
  fecha_original date [not null]
  fecha_nueva date [not null]
  motivo text
  usuario_reprogramo int
  fecha_reprogramacion timestamp [default: `CURRENT_TIMESTAMP`]
}

Table facturacion {
  id serial [pk]
  id_pedido serial
  cuf varchar(255)
  numero_factura_siat bigint
  fecha_emision_siat timestamp
  leyenda varchar(255)
  url_qr varchar(255)
  estado varchar(255) [not null]
  json_enviado text
  json_recibido text
  mensajes_error text
}

Table permisos {
  id_permiso serial [pk]
  codigo varchar(100) [unique, not null]
  nombre varchar(100) [not null]
  modulo varchar(50) [not null]
  accion varchar(20) [not null]
  estado boolean [default: true, not null]
}

Table roles_permisos {
  id_role int [not null]
  id_permiso int [not null]

  Indexes {
    (id_role, id_permiso) [pk]
  }
}

// =========================================================================
// RELACIONES
// =========================================================================
Ref: personas.id_persona < usuarios.id_persona
Ref: roles.id_rol < usuarios_roles.id_rol
Ref: usuarios.id_usuario < usuarios_roles.id_usuario
Ref: personas.id_persona < empleado.id_persona
Ref: usuarios.id_usuario < sesion.id_usuario
Ref: sesion.id_sesion < sesion_accion.id_sesion
Ref: sesion.id_sesion < refresh_token.id_sesion
Ref: refresh_token.id_refresh_token < refresh_token.reemplazado_por
Ref: personas.id_persona < proveedores.id_persona
Ref: categorias.id_categoria < material_produccion.id_categoria
Ref: unidades_medida.id_unidad < material_produccion.id_unidad
Ref: herramientas.id_herramienta < movimiento_herramientas.id_herramienta
Ref: usuarios.id_usuario < movimiento_herramientas.responsable
Ref: material_produccion.id_material < lotes_material.id_material
Ref: compras.id_compra < lotes_material.id_compra
Ref: proveedores.id_proveedor < compras.id_proveedor
Ref: compras.id_compra < detalle_compras.id_compra
Ref: material_produccion.id_material < detalle_compras.id_material
Ref: material_produccion.id_material < entradas.id_material
Ref: lotes_material.id_lote < entradas.id_lote
Ref: usuarios.id_usuario < entradas.responsable
Ref: material_produccion.id_material < movimiento_stock.id_material
Ref: lotes_material.id_lote < movimiento_stock.id_lote
Ref: compras.id_compra < movimiento_stock.id_compra
Ref: entradas.id_entrada < movimiento_stock.id_entrada
Ref: usuarios.id_usuario < movimiento_stock.id_usuario
Ref: material_produccion.id_material < residuos_material.id_material
Ref: lotes_material.id_lote < residuos_material.id_lote_origen
Ref: personas.id_persona < clientes.id_persona
Ref: empresas.id_empresa < clientes.id_empresa
Ref: usuarios.id_usuario < clientes.id_usuario
Ref: clientes.id_cliente < solicitud_cotizacion.id_cliente
Ref: solicitud_cotizacion.id_solicitud < solicitud_trabajo.id_solicitud
Ref: trabajos.id_trabajo < solicitud_trabajo.id_trabajo
Ref: solicitud_cotizacion.id_solicitud < cotizaciones.id_solicitud
Ref: cotizaciones.id_cotizacion < cotizacion_trabajo.id_cotizacion
Ref: solicitud_trabajo.id_solicitud_trabajo < cotizacion_trabajo.id_solicitud_trabajo
Ref: cotizacion_trabajo.id_cotizacion_trabajo < detalle_cotizacion.id_cotizacion_trabajo
Ref: material_produccion.id_material < detalle_cotizacion.id_material
Ref: cotizaciones.id_cotizacion < pedidos.id_cotizacion
Ref: clientes.id_cliente < pedidos.id_cliente
Ref: empleado.id_empleado < pedidos.entregado_por
Ref: pedidos.id_pedido < pagos_pedido.id_pedido
Ref: pedidos.id_pedido < orden_impresion.id_pedido
Ref: usuarios.id_usuario < orden_impresion.responsable
Ref: orden_impresion.id_orden < detalle_orden_impresion.id_orden
Ref: cotizacion_trabajo.id_cotizacion_trabajo < detalle_orden_impresion.id_cotizacion_trabajo
Ref: empleado.id_empleado < prestamos_material_trabajo.id_empleado
Ref: pedidos.id_pedido < prestamos_material_trabajo.id_pedido
Ref: prestamos_material_trabajo.id_prestamo < detalle_prestamo.id_prestamo
Ref: herramientas.id_herramienta < detalle_prestamo.id_herramienta
Ref: usuarios.id_usuario < planificacion_semanal.creado_por
Ref: planificacion_semanal.id_planificacion < trabajo_programado.id_planificacion
Ref: pedidos.id_pedido < trabajo_programado.id_pedido
Ref: orden_impresion.id_orden < trabajo_programado.id_orden_impresion
Ref: empleado.id_empleado < trabajo_programado.id_trabajador_asignado
Ref: trabajo_programado.id_trabajo_programado < reprogramacion_trabajo.id_trabajo_programado
Ref: usuarios.id_usuario < reprogramacion_trabajo.usuario_reprogramo
Ref: pedidos.id_pedido < facturacion.id_pedido
Ref: roles.id_rol < roles_permisos.id_role
Ref: permisos.id_permiso < roles_permisos.id_permiso

// =========================================================================
// ENUMS
// =========================================================================
Enum tipo_prestamo_enum {
  DIARIO
  PROYECTO
  INDEFINIDO
}

Enum estado_compra {
  Pendiente
  Completada
  Cancelada
}

Enum tipo_movimiento_enum {
  COMPRA
  SALIDA
  SOBRANTE
  DESECHO
}

Enum sesion_estado {
  ACTIVO
  CERRADO
}

Enum tipo_control_enum {
  UNIDAD
  ROLLO
  PLANO
  METRO2
}

Enum estado_herramienta_enum {
  DISPONIBLE
  EN_USO
  EN_MANTENIMIENTO
  DADO_DE_BAJA
}

Enum tipo_movimiento_herramienta_enum {
  ASIGNACION
  DEVOLUCION
  BAJA
  MANTENIMIENTO
}

Enum estado_residuo_enum {
  DISPONIBLE
  USADO
  DESCARTADO
}
