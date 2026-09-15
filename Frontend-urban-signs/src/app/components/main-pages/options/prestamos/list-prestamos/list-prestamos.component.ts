import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrestamoService } from '../../../../../core/services/prestamos/prestamo.service';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-list-prestamos',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    LoadingComponent,
    ViewToggleComponent,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ActionIconButtonComponent
  ],
  templateUrl: './list-prestamos.component.html',
  styleUrl: './list-prestamos.component.css'
})
export class ListPrestamosComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  private empleadoService = inject(EmployeeService);
  private herramientaService = inject(MaterialService);
  private prestamoService = inject(PrestamoService);
  private notificationService = inject(NotificationService);

  prestamos: any[] = [];
  isLoading = true;
  isProcessing = false;
  ListEmpleadosActivos: any[] = [];
  ListHerramientasActivas: any[] = [];
  totalElementos = 0;
  paginaActual = 0;
  tamanioPagina = 5;
  isConfirmModalOpen = false;
  isDetailModalOpen = false;
  isAnularModal = false;
  isDevolucionModal = false;

  idEmpleado: number | null = null;
  fechaPrestamo: string = new Date().toISOString().slice(0, 16);
  tipoPrestamo: string = 'DIARIO';
  observacion: string = '';
  fechaDevolucion: Date | null = null;
  selectedHerramientaId: number | null = null;
  HerramientasSeleccionadas: Array<{
    idHerramienta: number;
    nombre: string;
    codigo: string;
    foto?: string;
  }> = [];
  idPrestamo!: number;
  estadoSeleccionado: string = 'Prestado';
  tipoSeleccionado?: string;
  prestamoSeleccionado: any = null;

  ngOnInit(): void {
    this.cargarPrestamos();
    this.loadEmpleadosActivos();
    this.loadHerramientasActivas();
  }

  cambiarEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.paginaActual = 0;
    this.cargarPrestamos();
  }

  cambiarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.paginaActual = 0;
    this.cargarPrestamos();
  }

  cargarPrestamos() {
    this.isLoading = true;
    this.prestamoService
      .listPrestamos(this.estadoSeleccionado, this.tipoSeleccionado, this.paginaActual, this.tamanioPagina)
      .subscribe((data) => {
        this.prestamos = data.content;
        this.totalElementos = data.totalElements || 0;
        this.isLoading = false;
        console.log('Préstamos cargados:', data);
      });
  }

  openEditModal(prestamo: any): void {
    if (this.isProcessing) return;

    this.isConfirmModalOpen = true;
    this.idPrestamo = prestamo.idPrestamo;
    this.idEmpleado = prestamo.idEmpleado;
    this.fechaPrestamo = prestamo.fechaPrestamo;
    this.tipoPrestamo = prestamo.tipoPrestamo;
    this.observacion = prestamo.observacion || '';

    this.HerramientasSeleccionadas = prestamo.detalles.map((d: any) => ({
      idHerramienta: d.idHerramienta,
      nombre: d.nombreHerramienta,
      codigo: d.codigoHerramienta,
      foto: d.fotoHerramienta
    }));
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.idEmpleado = null;
    this.tipoPrestamo = 'DIARIO';
    this.selectedHerramientaId = null;
    this.HerramientasSeleccionadas = [];
    this.observacion = '';
  }

  onUpdate(): void {
    if (this.isProcessing) return;

    if (!this.idEmpleado) {
      this.notificationService.info('Seleccione un trabajador');
      return;
    }

    if (this.HerramientasSeleccionadas.length === 0) {
      this.notificationService.info('Agregue al menos una herramienta');
      return;
    }

    const payload = {
      idEmpleado: Number(this.idEmpleado),
      tipoPrestamo: this.tipoPrestamo,
      observacion: this.observacion,
      detalles: this.HerramientasSeleccionadas.map((h) => ({
        idHerramienta: h.idHerramienta
      }))
    };

    this.isProcessing = true;
    this.prestamoService.modificarPrestamo(this.idPrestamo, payload).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.show('Préstamo actualizado con éxito', 'success');
        this.isConfirmModalOpen = false;
        this.cargarPrestamos();
      },
      error: (err) => {
        console.error('Error al actualizar préstamo:', err);
        this.notificationService.show('Error al actualizar préstamo', 'error');
      }
    });
  }

  agregarHerramienta() {
    if (!this.selectedHerramientaId) {
      this.notificationService.info('Seleccione una herramienta');
      return;
    }

    const herramientaExistente = this.HerramientasSeleccionadas.find(
      (h) => h.idHerramienta === this.selectedHerramientaId
    );
    if (herramientaExistente) {
      this.notificationService.info('Herramienta ya agregada');
      return;
    }

    const herramienta = this.ListHerramientasActivas.find(
      (h) => h.idHerramienta === this.selectedHerramientaId
    );
    if (!herramienta) {
      this.notificationService.error('Herramienta no encontrada');
      return;
    }

    this.HerramientasSeleccionadas.push({
      idHerramienta: herramienta.idHerramienta,
      nombre: herramienta.nombre,
      codigo: herramienta.codigo,
      foto: herramienta.foto
    });

    this.selectedHerramientaId = null;
  }
  openDetailModal(prestamo: any): void {
    this.isDetailModalOpen = true;
    this.prestamoSeleccionado = prestamo;
  }

  eliminarHerramienta(index: number) {
    this.HerramientasSeleccionadas.splice(index, 1);
  }

  loadEmpleadosActivos() {
    this.empleadoService.obtenerEmpleadosActivos().subscribe({
      next: (data) => (this.ListEmpleadosActivos = data),
      error: (err) => console.error('Error cargando empleados:', err)
    });
  }

  loadHerramientasActivas() {
    this.herramientaService.listarMaterialesActivos().subscribe({
      next: (data) => (this.ListHerramientasActivas = data),
      error: (err) => console.error('Error cargando herramientas:', err)
    });
  }

  // =====================
  // DEVOLUCIONES / ANULACIÓN
  // =====================
  openAnularModal(prestamo: any): void {
    this.isAnularModal = true;
  }

  closeAnularModal(): void {
    this.isAnularModal = false;
  }

  openDevolucionModal(prestamo: any): void {
    if (this.isProcessing) return;

    this.isDevolucionModal = true;
    this.prestamoSeleccionado = prestamo;
    const ahora = new Date();
    this.fechaDevolucion = new Date(ahora.getTime() - 4 * 60 * 60 * 1000); // Hora Bolivia
  }

  closeDevolucionModal(): void {
    this.isDevolucionModal = false;
    this.prestamoSeleccionado = null;
  }

  confirmarDevolucion(): void {
    if (this.isProcessing) return;
    if (!this.prestamoSeleccionado) return;

    this.isProcessing = true;
    this.prestamoService
      .registrarDevolucion(this.prestamoSeleccionado.idPrestamo, this.observacion)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: () => {
          this.notificationService.show('Devolución registrada con éxito', 'success');
          this.closeDevolucionModal();
          this.cargarPrestamos();
        },
        error: (err) => console.error('Error al registrar devolución:', err)
      });
  }

  get fechaColumna() {
    return this.estadoSeleccionado === 'Prestado' ? 'Fecha de préstamo' : 'Fecha de devolución';
  }

  get fechaValor() {
    return (prestamo: any) =>
      this.estadoSeleccionado === 'Prestado' ? prestamo.fechaPrestamo : prestamo.fechaDevolucion;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.prestamoSeleccionado = null;
  }

  // Métodos de paginación
  getTotalPaginas(): number {
    return Math.ceil(this.totalElementos / this.tamanioPagina);
  }

  getRegistroInicio(): number {
    if (this.totalElementos === 0) return 0;
    return this.paginaActual * this.tamanioPagina + 1;
  }

  getRegistroFin(): number {
    const fin = (this.paginaActual + 1) * this.tamanioPagina;
    return Math.min(fin, this.totalElementos);
  }

  getPaginasVisibles(): number[] {
    const totalPaginas = this.getTotalPaginas();
    const paginas: number[] = [];

    // Si hay 7 páginas o menos, mostrar todas
    if (totalPaginas <= 7) {
      for (let i = 0; i < totalPaginas; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    // Lógica para mostrar páginas alrededor de la actual
    let inicio = Math.max(0, this.paginaActual - 2);
    let fin = Math.min(totalPaginas - 1, this.paginaActual + 2);

    // Ajustar si estamos cerca del inicio
    if (this.paginaActual < 3) {
      fin = Math.min(4, totalPaginas - 1);
      inicio = 0;
    }

    // Ajustar si estamos cerca del final
    if (this.paginaActual > totalPaginas - 4) {
      inicio = Math.max(0, totalPaginas - 5);
      fin = totalPaginas - 1;
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.getTotalPaginas()) return;

    this.paginaActual = pagina;
    this.cargarPrestamos();
  }

}
