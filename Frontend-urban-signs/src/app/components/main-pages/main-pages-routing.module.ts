import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSuppliersComponent } from './options/suppliers/list-suppliers/list-suppliers.component';
import { RegisterSuppliersComponent } from './options/suppliers/register-suppliers/register-suppliers.component';
import { ListClientsComponent } from './options/clients/list-clients/list-clients.component';
import { ListInventoryMaterialsComponent } from './options/inventory-materials/list-inventory-materials/list-inventory-materials.component';
import { ListInventoryProductionComponent } from './options/inventory-production/list-inventory-production/list-inventory-production.component';
import { ListStaffComponent } from './options/staff/list-staff/list-staff.component';
import { RegisterStaffComponent } from './options/staff/register-staff/register-staff.component';
import { RegisterInventoryProductionComponent } from './options/inventory-production/register-inventory-production/register-inventory-production.component';
import { RegisterInventoryMaterialsComponent } from './options/inventory-materials/register-inventory-materials/register-inventory-materials.component';
import { RegisterClientsComponent } from './options/clients/register-clients/register-clients.component';
import { WelcomeComponent } from './options/welcome/welcome/welcome.component';
import { CategorysComponent } from './options/categorys/categorys.component';
import { ListPrestamosComponent } from './options/prestamos/list-prestamos/list-prestamos.component';
import { RegistroPrestamoComponent } from './options/prestamos/registro-prestamo/registro-prestamo.component';
import { ListSolicitudesComponent } from './options/solicitud-cotizacion/list-solicitudes/list-solicitudes.component';
import { RegistrarCotizacionComponent } from './options/solicitud-cotizacion/registrar-cotizacion/registrar-cotizacion.component';
import { ListComprasComponent } from './options/compras/list-compras/list-compras.component';
import { RegistrarCompraComponent } from './options/compras/registrar-compra/registrar-compra.component';
import { ListStockComponent } from './options/stock/list-stock/list-stock.component';
import { RolesComponent } from './options/roles/roles/roles.component';
import { UnidadesComponent } from './options/unidades/unidades/unidades.component';
import { TrabajosComponent } from './options/trabajos/trabajos/trabajos.component';
import { SolicitudCotizacionComponent } from './options/solicitud-cotizacion/solicitud-cotizacion/solicitud-cotizacion.component';
import { AprobarCotizacionComponent } from './options/cotizaciones/aprobar-cotizacion/aprobar-cotizacion.component';
import { SeguimientoComponent } from './options/Seguimiento-trabajos/seguimiento/seguimiento.component';
import { ModificarSolicitudComponent } from './options/solicitud-cotizacion/modificar-solicitud/modificar-solicitud.component';
import { ListUsuariosComponent } from './options/usuarios/list-usuarios/list-usuarios.component';
import { ListCotizacionesComponent } from './options/cotizaciones/list-cotizaciones/list-cotizaciones.component';
import { PedidosComponent } from './options/pedidos/pedidos/pedidos.component';
import { PerfilComponent } from './options/perfil/perfil/perfil.component';
import { AyudaComponent } from './options/ayuda/ayuda/ayuda.component';
import { AccesosComponent } from './options/accesos/accesos/accesos.component';
import { OrdenTrabajoComponent } from './options/orden-trabajo/orden-trabajo/orden-trabajo.component';
import { EmisionOrdenImpresionComponent } from './options/orden-impresion/emision-orden-impresion/emision-orden-impresion.component';
import { RecepcionOrdenImpresionComponent } from './options/orden-impresion/recepcion-orden-impresion/recepcion-orden-impresion.component';
import { RegistrarOrdenImpresionComponent } from './options/orden-impresion/emision-orden-impresion/registrar-orden-impresion/registrar-orden-impresion.component';
import { VerDetallesComponent } from './options/pedidos/ver-detalles/ver-detalles.component';
import { ModificarOrdenImpresionComponent } from './options/orden-impresion/emision-orden-impresion/modificar-orden-impresion/modificar-orden-impresion.component';
import { FacturacionComponent } from './options/facturacion/facturacion/facturacion.component';
import { ListFacturacionesComponent } from './options/facturacion/list-facturaciones/list-facturaciones.component';
import { CompletarPedidoComponent } from './options/pedidos/completar-pedido/completar-pedido.component';
import { DashboardComponent } from './options/reportes/dashboard/dashboard.component';
import { RegistrarSobranteComponent } from './options/sobrantes/registrar-sobrante/registrar-sobrante.component';
import { RolePermissionsComponent } from './options/role-permissions/role-permissions/role-permissions.component';
import { permissionGuard } from '../../core/guards/permission.guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    component: WelcomeComponent
  },
  {
    path: 'list-staff',
    component: ListStaffComponent,
    canActivate: [permissionGuard], data: { permissions: ['EMPLEADO_VER'] }
  },
  {
    path: 'register-staff',
    component: RegisterStaffComponent,
    canActivate: [permissionGuard], data: { permissions: ['EMPLEADO_CREAR'] }
  },
  {
    path: 'list-users',
    component: ListUsuariosComponent,
    canActivate: [permissionGuard], data: { roles: ['Gerente'] }
  },
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [permissionGuard], data: { roles: ['Gerente'] }
  },
  {
    path: 'permisos-por-rol',
    component: RolePermissionsComponent,
    canActivate: [permissionGuard], data: { roles: ['Gerente'] }
  },
  {
    path: 'list-suppliers',
    component: ListSuppliersComponent,
    canActivate: [permissionGuard], data: { permissions: ['PROVEEDOR_VER'] }
  },
  {
    path: 'register-suppliers',
    component: RegisterSuppliersComponent,
    canActivate: [permissionGuard], data: { permissions: ['PROVEEDOR_CREAR'] }
  },
  {
    path: 'list-compras',
    component: ListComprasComponent,
    canActivate: [permissionGuard], data: { permissions: ['COMPRA_VER', 'COMPRA_CREAR', 'COMPRA_EDITAR'] }
  },
  {
    path: 'list-trabajos',
    component: TrabajosComponent,
    canActivate: [permissionGuard], data: { permissions: ['TRABAJO_VER'] }
  },
  {
    path: 'registrar-compras',
    component: RegistrarCompraComponent,
    canActivate: [permissionGuard], data: { permissions: ['COMPRA_CREAR'] }
  },
  {
    path: 'list-category',
    component: CategorysComponent,
    canActivate: [permissionGuard], data: { permissions: ['CATEGORIA_VER'] }
  },
  {
    path: 'list-inventory-production',
    component: ListInventoryProductionComponent,
    canActivate: [permissionGuard], data: { permissions: ['MATERIAL_VER'] }
  },
  {
    path: 'register-inventory-production',
    component: RegisterInventoryProductionComponent,
    canActivate: [permissionGuard], data: { permissions: ['MATERIAL_CREAR'] }
  },
  {
    path: 'list-inventory-materials',
    component: ListInventoryMaterialsComponent,
    canActivate: [permissionGuard], data: { permissions: ['HERRAMIENTA_VER'] }
  },
  {
    path: 'list-stock',
    component: ListStockComponent,
    canActivate: [permissionGuard], data: { permissions: ['MATERIAL_VER', 'LOTE_VER'] }
  },
  {
    path: 'register-inventory-materials',
    component: RegisterInventoryMaterialsComponent,
    canActivate: [permissionGuard], data: { permissions: ['HERRAMIENTA_CREAR'] }
  },
  {
    path: 'list-prestamos',
    component: ListPrestamosComponent,
    canActivate: [permissionGuard], data: { permissions: ['PRESTAMO_VER'] }
  },
  {
    path: 'register-prestamo',
    component: RegistroPrestamoComponent,
    canActivate: [permissionGuard], data: { permissions: ['PRESTAMO_CREAR'] }
  },
  {
    path: 'list-solicitudes',
    component: ListSolicitudesComponent,
    canActivate: [permissionGuard], data: { permissions: ['SOLICITUD_COTIZACION_VER', 'SOLICITUD_COTIZACION_CREAR', 'SOLICITUD_COTIZACION_EDITAR'] }
  },
  {
    path: 'list-cotizaciones',
    component: ListCotizacionesComponent,
    canActivate: [permissionGuard], data: { permissions: ['COTIZACION_VER', 'COTIZACION_CREAR', 'COTIZACION_EDITAR'] }
  },
  {
    path: 'registrar-cotizacion/:id',
    component: RegistrarCotizacionComponent,
    canActivate: [permissionGuard], data: { permissions: ['COTIZACION_CREAR'] }
  },
  {
    path: 'confirmar-cotizacion/:id',
    component: AprobarCotizacionComponent,
    canActivate: [permissionGuard], data: { permissions: ['COTIZACION_EDITAR'] }
  },
  {
    path: 'solicitud-cotizacion',
    component: SolicitudCotizacionComponent,
    canActivate: [permissionGuard], data: { permissions: ['SOLICITUD_COTIZACION_CREAR'] }
  },
  {
    path: 'modificar-solicitud',
    component: ModificarSolicitudComponent,
    canActivate: [permissionGuard], data: { permissions: ['SOLICITUD_COTIZACION_EDITAR'] }
  },
  {
    path: 'seguimiento',
    component: SeguimientoComponent,
    canActivate: [permissionGuard], data: { permissions: ['PLANIFICACION_VER'] }
  },
  {
    path: 'list-clients',
    component: ListClientsComponent,
    canActivate: [permissionGuard], data: { permissions: ['CLIENTE_VER'] }
  },
  {
    path: 'register-clients',
    component: RegisterClientsComponent,
    canActivate: [permissionGuard], data: { permissions: ['CLIENTE_CREAR'] }
  },
  {
    path: 'list-unidades',
    component: UnidadesComponent,
    canActivate: [permissionGuard], data: { permissions: ['UNIDAD_MEDIDA_ACCESO'] }
  },
  {
    path: 'list-pedidos',
    component: PedidosComponent,
    canActivate: [permissionGuard], data: { permissions: ['PEDIDO_VER'] }
  },
  {
    path: 'list-ordenes-trabajo',
    component: OrdenTrabajoComponent,
    canActivate: [permissionGuard], data: { permissions: ['COTIZACION_VER'] }
  },
  {
    path: 'emision-ordenes-impresion',
    component: EmisionOrdenImpresionComponent,
    canActivate: [permissionGuard], data: { permissions: ['ORDEN_IMPRESION_VER'] }
  },
  {
    path: 'modificar-orden-impresion',
    component: ModificarOrdenImpresionComponent,
    canActivate: [permissionGuard], data: { permissions: ['ORDEN_IMPRESION_EDITAR'] }
  },
  {
    path: 'recepcion-ordenes-impresion',
    component: RecepcionOrdenImpresionComponent,
    canActivate: [permissionGuard], data: { permissions: ['ORDEN_IMPRESION_VER'] }
  },
  {
    path: 'registrar-ordenes-impresion',
    component: RegistrarOrdenImpresionComponent,
    canActivate: [permissionGuard], data: { permissions: ['ORDEN_IMPRESION_CREAR'] }
  },
  {
    path: 'ver-detalles-pedido',
    component: VerDetallesComponent,
    canActivate: [permissionGuard], data: { permissions: ['PEDIDO_VER'] }
  },
  {
    path: 'list-facturacion',
    component: ListFacturacionesComponent,
    canActivate: [permissionGuard], data: { permissions: ['FACTURACION_VER'] }
  },
  {
    path: 'registrar-facturacion',
    component: FacturacionComponent,
    canActivate: [permissionGuard], data: { permissions: ['FACTURACION_CREAR'] }
  },
  {
    path: 'completar-pedido',
    component: CompletarPedidoComponent,
    canActivate: [permissionGuard], data: { permissions: ['PEDIDO_EDITAR'] }
  },
  {
    path: 'registrar-residuos-reutilizables',
    component: RegistrarSobranteComponent,
    canActivate: [permissionGuard], data: { permissions: ['RESIDUO_CREAR'] }
  },
  {
    path: 'perfil',
    component: PerfilComponent
  },
  {
    path: 'ayuda',
    component: AyudaComponent
  },
  {
    path: 'accesos',
    component: AccesosComponent,
    canActivate: [permissionGuard], data: { roles: ['Gerente'] }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [permissionGuard], data: { permissions: ['DASHBOARD_VER'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainPagesRoutingModule { }
