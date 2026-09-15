import { Component, inject, ViewChild } from '@angular/core';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../../../core/models/category/category.model';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { VerDetallesComponent } from "../ver-detalles/ver-detalles.component";
import { CompletarPedidoComponent } from "../completar-pedido/completar-pedido.component";
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, VerDetallesComponent, CompletarPedidoComponent,
    LoadingComponent, ViewToggleComponent, ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective,
    DataCardDirective, ActionIconButtonComponent],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {
  viewMode: 'list' | 'cards' = 'list';
  @ViewChild(CompletarPedidoComponent) modalCompletarPedido!: CompletarPedidoComponent;

  notificationService = inject(NotificationService)
  private pedidoService = inject(PedidosService);
  fb = inject(FormBuilder);

  listPedidos: any[] = [];

  nombreYaExiste: boolean = false;
  pedido?: any;
  Math = Math;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  cargando = false;
  cargandoAccion = false;
  isProcessing = false;

  isModalOpen = false;
  isEditing = false;
  searchTerm = '';
  statusFilter: 'true' | 'false' | 'todos' = 'true';
  itemsPerPage = 5;
  categoryForm!: FormGroup;
  selectedCategoryId: number | null = null;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  filterStatus: boolean = true;
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 0;
  mostrarModalVisualizacion = false;
  mostrarModalCompletar = false;

  cotizacionSeleccionada: any;
  pedidoSeleccionado: any;


  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.initForm();
    this.categoryForm.controls['nombre'].valueChanges.subscribe(() => {
      this.nombreYaExiste = false;
    });
    this.loadPedidos();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/)
      ]]
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  confirm(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.closeConfirmModal();
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.confirmMessage = '';
    this.confirmTitle = '';
    this.confirmAction = null;
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }


  loadPedidos(page: number = 1) {
    this.cargando = true;
    this.pedidoService.listarPedidos(page - 1, this.pageSize).subscribe(data => {
      this.listPedidos = data.content;
      console.log('Pedidos cargados:', this.listPedidos);
      this.totalItems = data.totalElements;
      this.totalPages = data.totalPages;
      this.currentPage = data.number + 1;
      this.cargando = false;
    });
  }

  previousPage() {
    if (this.currentPage > 1) this.loadPedidos(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadPedidos(this.currentPage + 1);
  }

  goToPage(page: number) {
    this.loadPedidos(page);
  }

  getPages() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }


  cerrarModalVisualizacion(): void {
    this.mostrarModalVisualizacion = false;
    this.pedidoSeleccionado = null;
  }


  cerrarModalCompletar(): void {
    this.mostrarModalCompletar = false;
    this.pedidoSeleccionado = null;
  }


  visualizarModal(pedido: any): void {
    this.cargandoAccion = true;
    this.pedidoService.obtenerDetallesPedido(pedido.idPedido).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
        this.mostrarModalVisualizacion = true;
        this.cargandoAccion = false;
      },
      error: (err) => {
        this.cargandoAccion = false;
        console.error('Error al cargar detalle:', err);
        this.notificationService.error('No se pudo cargar el detalle del pedido');
      }
    });
  }


  completarPedido(pedido: any): void {
    this.cargandoAccion = true;
    this.pedidoService.obtenerDetallesPedido(pedido.idPedido).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
        this.mostrarModalCompletar = true;
        this.cargandoAccion = false;
      },
      error: (err) => {
        this.cargandoAccion = false;
        console.error('Error al cargar detalle:', err);
        this.notificationService.error('No se pudo cargar el detalle del pedido');
      }
    });
  }

  manejarCompletacionPedido(datos: {
    pedidoId: number;
    pagoFinal?: any;
    fotoArchivo?: File;
    observacionEntrega?: string;
    idEmpleado?: number;
  }): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (datos.fotoArchivo) {
      const formData = new FormData();
      formData.append('foto', datos.fotoArchivo);
      if (datos.idEmpleado) {
        formData.append('idEmpleado', datos.idEmpleado.toString());
      }
      if (datos.observacionEntrega) {
        formData.append('observacion', datos.observacionEntrega);
      }
      if (datos.pagoFinal) {
        formData.append('monto', datos.pagoFinal.monto.toString());
        formData.append('metodoPago', datos.pagoFinal.metodoPago);
      }

      this.pedidoService.registrarEntregaConFoto(datos.pedidoId, formData).pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: (response) => {
          if (this.modalCompletarPedido) {
            this.modalCompletarPedido.completacionExitosa();
          }
          this.notificationService.success('¡Entrega física con evidencia registrada exitosamente!');
          this.loadPedidos(this.currentPage);
        },
        error: (error) => {
          console.error('Error al registrar entrega con foto:', error);
          const mensajeError = error.error?.message || 'Error al registrar la entrega del pedido.';
          if (this.modalCompletarPedido) {
            this.modalCompletarPedido.completacionFallida(mensajeError);
          }
          this.notificationService.error(mensajeError);
        }
      });
    } else {
      const payload: any = {};
      if (datos.pagoFinal) {
        payload.pagoFinal = {
          monto: datos.pagoFinal.monto,
          metodoPago: datos.pagoFinal.metodoPago,
          observacion: datos.pagoFinal.observacion
        };
      }
      if (datos.observacionEntrega) {
        payload.observacionEntrega = datos.observacionEntrega;
      }
      if (datos.idEmpleado) {
        payload.idEmpleado = datos.idEmpleado;
      }

      this.pedidoService.completarPedido(datos.pedidoId, payload).pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: (response) => {
          if (this.modalCompletarPedido) {
            this.modalCompletarPedido.completacionExitosa();
          }
          this.notificationService.success('¡Pedido completado exitosamente!');
          this.loadPedidos(this.currentPage);
        },
        error: (error) => {
          console.error('Error al completar pedido:', error);
          const mensajeError = error.error?.message || 'Error al completar el pedido. Por favor intente nuevamente.';
          if (this.modalCompletarPedido) {
            this.modalCompletarPedido.completacionFallida(mensajeError);
          }
          this.notificationService.error(mensajeError);
        }
      });
    }
  }

  verFactura(idPedido: number): void {
    console.log('Verificando factura para el pedido ID:', idPedido);
    this.cargandoAccion = true;
    this.pedidoService.obtenerFactura(idPedido).subscribe({
      next: (factura) => {
        this.cargandoAccion = false;
        if (factura && factura.urlQr) {
          // Abrir la URL en una nueva pestaña
          window.open(factura.urlQr, '_blank');
        } else {
          this.notificationService.error('La factura existe pero no tiene URL válida.');
        }
      },
      error: (err) => {
        this.cargandoAccion = false;
        console.error(err);
        this.notificationService.error('No se encontró factura para este pedido.');
      }
    });
  }
}
