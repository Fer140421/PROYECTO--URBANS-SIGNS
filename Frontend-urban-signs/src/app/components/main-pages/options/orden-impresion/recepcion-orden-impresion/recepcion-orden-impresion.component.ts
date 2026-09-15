import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { Category } from '../../../../../core/models/category/category.model';
import { OrdenImpresionService } from '../../../../../core/services/orden-impresion/orden-impresion.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-recepcion-orden-impresion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './recepcion-orden-impresion.component.html',
  styleUrl: './recepcion-orden-impresion.component.css'
})
export class RecepcionOrdenImpresionComponent {
  viewMode: 'list' | 'cards' = 'list';
  notificationService = inject(NotificationService);
  private pedidoService = inject(PedidosService);
  private ordenImpresionService = inject(OrdenImpresionService);
  fb = inject(FormBuilder);

  // Variables principales
  ListOrdenImpresion: any[] = [];
  selectedOrden: any = null;
  isDetalleModalOpen = false;
  isRecepcionModalOpen = false;
  Math = Math;


  // Filtros y búsqueda
  searchTerm = '';
  statusFilter: string = 'PENDIENTE';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Contador de pendientes
  listPendientes = 0;
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    this.loadOrdenImpresion();
  }

  loadOrdenImpresion() {
    this.isLoading = true;
    this.ordenImpresionService.getOrdenesPorEstado(this.statusFilter,this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (data) => {
          this.ListOrdenImpresion = data.content;
          this.totalItems = data.totalElements;
          this.totalPages = data.totalPages;
          this.currentPage = data.number + 1;
          this.calculatePendientes();
          this.isLoading = false;
          console.log('Órdenes cargadas:', this.ListOrdenImpresion);
        },
        error: (error) => {
          this.notificationService.error('Error al cargar las órdenes de impresión');
          console.error('Error:', error);
        }
      });
  }

  calculatePendientes() {
    this.listPendientes = this.ListOrdenImpresion.filter(
      orden => orden.estado === 'PENDIENTE'
    ).length;
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadOrdenImpresion();
    } else {
      this.filtrarOrdenes();
    }
  }

  onFilterChange() {
    this.currentPage = 1;
    if (this.statusFilter === 'PENDIENTE') {
      this.loadOrdenImpresion();
    } else {
      this.filtrarPorEstado();
    }
  }

  filtrarOrdenes() {
    const term = this.searchTerm.toLowerCase();
    this.ListOrdenImpresion = this.ListOrdenImpresion.filter(orden =>
      orden.nroOrden?.toLowerCase().includes(term) ||
      orden.usuario?.userAcces?.toLowerCase().includes(term)
    );
  }

  filtrarPorEstado() {
    this.isLoading = true;
    this.ordenImpresionService.getOrdenesPorEstado(
      this.statusFilter,
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.ListOrdenImpresion = data.content;
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al filtrar órdenes');
        console.error('Error:', error);
      }
    });
  }

  formatDate(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatTime(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getFileName(filePath: string): string {
    if (!filePath) return 'archivo.zip';
    const parts = filePath.split('\\');
    return parts[parts.length - 1];
  }

  descargarArchivo(orden: any) {
    if (!orden.archivoAdjunto) {
      this.notificationService.warning('Esta orden no tiene archivos adjuntos');
      return;
    }

    this.ordenImpresionService.descargarArchivo(orden.idOrden).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.getFileName(orden.archivoAdjunto);
        link.click();
        window.URL.revokeObjectURL(url);

        this.notificationService.success('Archivo descargado correctamente');
      },
      error: (error) => {
        this.notificationService.error('Error al descargar el archivo');
        console.error('Error:', error);
      }
    });
  }

  verDetalles(orden: any) {
    this.selectedOrden = orden;
    this.isDetalleModalOpen = true;
  }

  closeDetalleModal() {
    this.isDetalleModalOpen = false;
    this.selectedOrden = null;
  }

  // Métodos para el modal de recepción
  abrirModalRecepcion(orden: any) {
    this.selectedOrden = orden;
    this.isRecepcionModalOpen = true;
  }

  cerrarModalRecepcion() {
    this.isRecepcionModalOpen = false;
    this.selectedOrden = null;
  }

  confirmarRecepcionOrden() {
    if (this.isProcessing || !this.selectedOrden?.idOrden) return;

    this.isProcessing = true;
    this.ordenImpresionService.cambiarEstado(this.selectedOrden.idOrden, "RECEPCIONADO").pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response) => {
        this.notificationService.success(`Orden ${this.selectedOrden.nroOrden} recepcionada correctamente`);
        this.cerrarModalRecepcion();
        this.loadOrdenImpresion();
      },
      error: (error) => {
        this.notificationService.error('Error al recepcionar la orden');
        console.error('Error:', error);
      }
    });
  }

  completarTrabajo(orden: any) {
    if (this.isProcessing || !orden?.idOrden) return;

    this.isProcessing = true;
    this.ordenImpresionService.cambiarEstado(orden.idOrden, 'COMPLETADO').pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.success(`Trabajo completado: ${orden.nroOrden}`);
        this.loadOrdenImpresion();
      },
      error: (error) => {
        this.notificationService.error('Error al completar el trabajo');
        console.error('Error:', error);
      }
    });
  }

  imprimirOrden(orden: any) {
    window.print();
    this.notificationService.info(`Imprimiendo orden: ${orden.nroOrden}`);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrdenImpresion();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrdenImpresion();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadOrdenImpresion();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

}
