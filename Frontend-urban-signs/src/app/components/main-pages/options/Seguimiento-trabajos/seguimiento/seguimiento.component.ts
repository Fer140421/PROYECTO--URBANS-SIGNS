import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { FormsModule } from '@angular/forms';
import { PedidoResumen, PlanificacionSemanal, PlanificacionService, TrabajoDisponible, TrabajoProgramado, CrearTrabajoRequest } from '../../../../../core/services/planificacion/planificacion.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { Empleado } from '../../../../../core/models/employee/ListEmpleadosActivos.model';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';
// Interfaces
interface Trabajo {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  dimensiones: string;
  estado: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fechaInicio: string;
  fechaEntrega: string;
  progreso: number;
  responsable: string;
  materiales: any[];
  observaciones: string;
}

interface Estadisticas {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  porEntregar: number;
  vencidos: number;
}

interface ColumnaKanban {
  nombre: string;
  estado: string;
  trabajos: Trabajo[];
}
@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ViewToggleComponent, ResponsiveDataViewComponent,
    DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent {
  viewMode: 'list' | 'cards' = 'list';
  private planificacionService = inject(PlanificacionService);
  private pedidosService = inject(PedidosService);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Datos principales
  planificacionActual: PlanificacionSemanal | null = null;
  trabajos: TrabajoProgramado[] = [];
  trabajosFiltrados: TrabajoProgramado[] = [];
  cargando = false;

  // ✅ NUEVOS DATOS PARA PEDIDOS
  pedidosPendientes: PedidoResumen[] = [];
  trabajosDisponibles: TrabajoDisponible[] = [];
  pedidoSeleccionado: number | null = null;
  cargandoPedidos = false;
  isProcessing = false;

  // Operarios
  empleadosActivos: Empleado[] = [];

  // Filtros
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';
  filtroAreaTrabajo: string = '';

  // Áreas de trabajo únicas
  areasTrabajo: string[] = ['ENSAMBLAJE', 'ESTRUCTURAS', 'TALLER', 'EXTERNO'];

  // Estadísticas
  estadisticas = {
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completados: 0,
    porEntregar: 0
  };

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 50;

  // Modales
  mostrarModalNuevoTrabajo = false;
  mostrarModalEditarTrabajo = false;
  trabajoEditando: TrabajoProgramado | null = null;

  // ✅ ACTUALIZAR Formulario de nuevo trabajo
  nuevoTrabajo = {
    idPedido: null as number | null,
    areaTrabajo: 'ENSAMBLAJE',
    idTrabajador: null as number | null,
    trabajador: '',
    fechaProgramada: '',
    horaProgramada: '',
    observaciones: ''
  };

  ngOnInit(): void {
    this.cargarPlanificacionActual();
    this.cargarPedidosPendientes(); // ✅ NUEVO
    this.cargarEmpleadosActivos();
  }

  cargarEmpleadosActivos(): void {
    this.employeeService.obtenerEmpleadosActivos().subscribe({
      next: (empleados) => {
        this.empleadosActivos = empleados;
      },
      error: (err) => console.error('Error al cargar empleados:', err)
    });
  }

  // ========== CARGA DE DATOS ==========

  cargarPlanificacionActual(): void {
    this.cargando = true;
    this.planificacionService.obtenerPlanificacionActual().subscribe({
      next: (planificacion) => {
        this.planificacionActual = planificacion;
        this.trabajos = planificacion.trabajos || [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.log('Error capturado:', err);
        if (err.status === 404 || err.status === 500) {
          this.crearNuevaPlanificacion();
          return;
        }
        this.cargando = false;
      }
    });
  }

  cargarPedidosPendientes(): void {
    this.cargandoPedidos = true;
    this.pedidosService.obtenerPedidosPendientes().subscribe({
      next: (pedidos) => {
        this.pedidosPendientes = pedidos;
        this.cargandoPedidos = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargandoPedidos = false;
      }
    });
  }

  onPedidoSeleccionado(idPedido: number): void {
    this.pedidoSeleccionado = idPedido;
    if (idPedido) {
      this.cargarTrabajosDisponibles(idPedido);
    } else {
      this.trabajosDisponibles = [];
    }
  }

  // ✅ NUEVO MÉTODO
  cargarTrabajosDisponibles(idPedido: number): void {
    this.pedidosService.obtenerTrabajosDisponibles(idPedido).subscribe({
      next: (trabajos) => {
        this.trabajosDisponibles = trabajos;
      },
      error: (err) => {
        console.error('Error al cargar trabajos del pedido:', err);
        this.notificationService.error('Error al cargar trabajos del pedido');
      }
    });
  }

  crearNuevaPlanificacion(): void {
    if (this.isProcessing) return;

    const hoy = new Date().toISOString().split('T')[0];
    const usuarioId = 1;

    this.isProcessing = true;
    this.planificacionService.crearPlanificacion(hoy, usuarioId).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (planificacion) => {
        this.planificacionActual = planificacion;
        this.trabajos = [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
        this.notificationService.success('Planificación semanal creada');
      },
      error: (err) => {
        console.error('Error al crear planificación:', err);
        this.notificationService.error('Error al crear la planificación');
        this.cargando = false;
      }
    });
  }

  // ========== FILTRADO (sin cambios) ==========
  aplicarFiltros(): void {
    let resultados = [...this.trabajos];

    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultados = resultados.filter(trabajo =>
        trabajo.cliente?.toLowerCase().includes(busqueda) ||
        trabajo.descripcionTrabajo?.toLowerCase().includes(busqueda) ||
        trabajo.trabajador?.toLowerCase().includes(busqueda)
      );
    }

    if (this.filtroEstado) {
      resultados = resultados.filter(trabajo => trabajo.estado === this.filtroEstado);
    }

    if (this.filtroAreaTrabajo) {
      resultados = resultados.filter(trabajo => trabajo.areaTrabajo === this.filtroAreaTrabajo);
    }

    if (this.filtroFecha) {
      const hoy = new Date();
      resultados = resultados.filter(trabajo => {
        const fechaTrabajo = new Date(trabajo.fechaProgramada);
        switch (this.filtroFecha) {
          case 'HOY':
            return this.esMismaFecha(fechaTrabajo, hoy);
          case 'SEMANA':
            return this.esMismaSemana(fechaTrabajo, hoy);
          case 'VENCIDO':
            return fechaTrabajo < hoy && trabajo.estado !== 'COMPLETADO';
          default:
            return true;
        }
      });
    }

    resultados.sort((a, b) => {
      const fechaA = new Date(a.fechaProgramada).getTime();
      const fechaB = new Date(b.fechaProgramada).getTime();
      return fechaA - fechaB;
    });

    this.trabajosFiltrados = resultados;
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.trabajos.length;
    this.estadisticas.pendientes = this.trabajos.filter(t => t.estado === 'PENDIENTE').length;
    this.estadisticas.enProceso = this.trabajos.filter(t => t.estado === 'EN_PROCESO').length;
    this.estadisticas.completados = this.trabajos.filter(t => t.estado === 'COMPLETADO').length;

    const hoy = new Date();
    this.estadisticas.porEntregar = this.trabajos.filter(t =>
      new Date(t.fechaProgramada) <= hoy && t.estado !== 'COMPLETADO'
    ).length;
  }

  // ========== ACCIONES DE TRABAJOS ==========

  abrirModalNuevoTrabajo(): void {
    if (!this.planificacionActual) {
      this.notificationService.error('No hay planificación activa');
      return;
    }

    // ✅ RESETEAR FORMULARIO
    this.nuevoTrabajo = {
      idPedido: null,
      areaTrabajo: 'ENSAMBLAJE',
      idTrabajador: null,
      trabajador: '',
      fechaProgramada: new Date().toISOString().split('T')[0],
      horaProgramada: '',
      observaciones: ''
    };

    this.pedidoSeleccionado = null;
    this.trabajosDisponibles = [];
    this.mostrarModalNuevoTrabajo = true;
  }

  cerrarModalNuevoTrabajo(): void {
    this.mostrarModalNuevoTrabajo = false;
    this.pedidoSeleccionado = null;
    this.trabajosDisponibles = [];
  }

  // ✅ ACTUALIZAR MÉTODO
  guardarNuevoTrabajo(): void {
    if (this.isProcessing) return;

    if (!this.planificacionActual) return;

    if (!this.nuevoTrabajo.idPedido) {
      this.notificationService.error('Debe seleccionar un pedido');
      return;
    }

    if (!this.nuevoTrabajo.fechaProgramada || !this.nuevoTrabajo.idTrabajador) {
      this.notificationService.error('Debe seleccionar el trabajador asignado y la fecha');
      return;
    }

    const emp = this.empleadosActivos.find(e => e.idEmployee === Number(this.nuevoTrabajo.idTrabajador));
    const nombreTrabajador = emp ? emp.fullName : this.nuevoTrabajo.trabajador;

    const request: CrearTrabajoRequest = {
      idPlanificacion: this.planificacionActual.idPlanificacion,
      idPedido: this.nuevoTrabajo.idPedido,
      areaTrabajo: this.nuevoTrabajo.areaTrabajo,
      idTrabajador: Number(this.nuevoTrabajo.idTrabajador),
      trabajador: nombreTrabajador,
      fechaProgramada: this.nuevoTrabajo.fechaProgramada,
      horaProgramada: this.nuevoTrabajo.horaProgramada,
      observaciones: this.nuevoTrabajo.observaciones
    };

    this.isProcessing = true;
    this.planificacionService.crearTrabajo(request).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (trabajo) => {
        this.trabajos.push(trabajo);
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargarPedidosPendientes();
        this.cerrarModalNuevoTrabajo();
        this.notificationService.success('Trabajo creado y pedido actualizado');
      },
      error: (err) => {
        console.error('Error al crear trabajo:', err);
        this.notificationService.error('Error al crear el trabajo');
      }
    });
  }

  editarTrabajo(trabajo: TrabajoProgramado): void {
    this.trabajoEditando = { ...trabajo };
    this.mostrarModalEditarTrabajo = true;
  }

  cerrarModalEditarTrabajo(): void {
    this.mostrarModalEditarTrabajo = false;
    this.trabajoEditando = null;
  }

  // ✅ ACTUALIZAR MÉTODO
  guardarEdicionTrabajo(): void {
    if (this.isProcessing) return;

    if (!this.trabajoEditando) return;

    const emp = this.empleadosActivos.find(e => e.idEmployee === Number(this.trabajoEditando!.idTrabajador));
    const nombreTrabajador = emp ? emp.fullName : this.trabajoEditando!.trabajador;

    const request: CrearTrabajoRequest = {
      idPlanificacion: this.trabajoEditando.idPlanificacion,
      idPedido: this.trabajoEditando.idPedido!,
      areaTrabajo: this.trabajoEditando.areaTrabajo,
      idTrabajador: this.trabajoEditando.idTrabajador ? Number(this.trabajoEditando.idTrabajador) : undefined,
      trabajador: nombreTrabajador,
      fechaProgramada: this.trabajoEditando.fechaProgramada,
      horaProgramada: this.trabajoEditando.horaProgramada,
      observaciones: this.trabajoEditando.observaciones
    };

    this.isProcessing = true;
    this.planificacionService.actualizarTrabajo(this.trabajoEditando.idTrabajoProgramado, request).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (trabajoActualizado) => {
        const index = this.trabajos.findIndex(t => t.idTrabajoProgramado === trabajoActualizado.idTrabajoProgramado);
        if (index !== -1) {
          this.trabajos[index] = trabajoActualizado;
        }
        this.aplicarFiltros();
        this.cerrarModalEditarTrabajo();
        this.notificationService.success('Trabajo actualizado');
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        this.notificationService.error('Error al actualizar el trabajo');
      }
    });
  }

  eliminarTrabajo(trabajo: TrabajoProgramado): void {
    if (this.isProcessing) return;

    if (!confirm(`¿Está seguro de eliminar el trabajo "${trabajo.descripcionTrabajo}"?`)) {
      return;
    }

    this.isProcessing = true;
    this.planificacionService.eliminarTrabajo(trabajo.idTrabajoProgramado).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.trabajos = this.trabajos.filter(t => t.idTrabajoProgramado !== trabajo.idTrabajoProgramado);
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.notificationService.success('Trabajo eliminado');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.notificationService.error('Error al eliminar el trabajo');
      }
    });
  }

  marcarCompletado(trabajo: TrabajoProgramado): void {
    if (this.isProcessing) return;

    if (!confirm(`¿Marcar como completado: "${trabajo.descripcionTrabajo}"?`)) {
      return;
    }

    this.isProcessing = true;
    this.planificacionService.marcarCompletado(trabajo.idTrabajoProgramado).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (trabajoActualizado) => {
        const index = this.trabajos.findIndex(t => t.idTrabajoProgramado === trabajoActualizado.idTrabajoProgramado);
        if (index !== -1) {
          this.trabajos[index] = trabajoActualizado;
        }
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargarPedidosPendientes();
        this.notificationService.success('Trabajo completado ✓. Si era el último del pedido, pasó a estado Listo para Entrega.');
      },
      error: (err) => {
        console.error('Error al completar:', err);
        this.notificationService.error('Error al marcar como completado');
      }
    });
  }

  // ========== MÉTODOS DE UTILIDAD (sin cambios) ==========

  getClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      'EN_PROCESO': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      'COMPLETADO': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      'REPROGRAMADO': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'
    };
    return clases[estado] || clases['PENDIENTE'];
  }

  getClaseFechaEntrega(fechaProgramada: string): string {
    const hoy = new Date();
    const fecha = new Date(fechaProgramada);
    const diffTime = fecha.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 font-bold';
    if (diffDays === 0) return 'text-orange-600 font-bold';
    if (diffDays <= 2) return 'text-yellow-600';
    return 'text-gray-900';
  }

  calcularDiasRestantes(fechaProgramada: string): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaProgramada);
    fecha.setHours(0, 0, 0, 0);
    const diffTime = fecha.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '¡Hoy!';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 1) return `En ${diffDays} días`;
    if (diffDays === -1) return 'Ayer';
    return `Hace ${Math.abs(diffDays)} días`;
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '??';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return fecha1.toDateString() === fecha2.toDateString();
  }

  private esMismaSemana(fecha1: Date, fecha2: Date): boolean {
    const inicioSemana1 = new Date(fecha1);
    const inicioSemana2 = new Date(fecha2);
    inicioSemana1.setDate(fecha1.getDate() - fecha1.getDay());
    inicioSemana2.setDate(fecha2.getDate() - fecha2.getDay());
    return inicioSemana1.toDateString() === inicioSemana2.toDateString();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual * this.itemsPorPagina < this.trabajosFiltrados.length) {
      this.paginaActual++;
    }
  }

  get trabajosPaginados(): TrabajoProgramado[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.trabajosFiltrados.slice(inicio, fin);
  }

  actualizarVista(): void {
    this.cargarPlanificacionActual();
    this.cargarPedidosPendientes();
  }

  exportarExcel(): void {
    this.notificationService.info('Función de exportación en desarrollo');
  }
}
