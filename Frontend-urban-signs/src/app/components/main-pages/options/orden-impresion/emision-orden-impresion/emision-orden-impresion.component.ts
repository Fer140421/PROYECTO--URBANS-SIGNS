import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { OrdenImpresionService } from '../../../../../core/services/orden-impresion/orden-impresion.service';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { DetallesCotizacionComponent } from "../../cotizaciones/detalles-cotizacion/detalles-cotizacion.component";
import { VerDetallesComponent } from "../../pedidos/ver-detalles/ver-detalles.component";
import { DetallesPedidoComponent } from "./detalles-pedido/detalles-pedido.component";
import { ModificarOrdenImpresionComponent } from "./modificar-orden-impresion/modificar-orden-impresion.component";
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';

@Component({
  selector: 'app-emision-orden-impresion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DetallesPedidoComponent, ModificarOrdenImpresionComponent,
    LoadingComponent, ViewToggleComponent, ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective,
    DataCardDirective, ActionIconButtonComponent],
  templateUrl: './emision-orden-impresion.component.html',
  styleUrl: './emision-orden-impresion.component.css'
})
export class EmisionOrdenImpresionComponent {
  viewMode: 'list' | 'cards' = 'list';
  notificationService = inject(NotificationService)
  private pedidoService = inject(PedidosService);
  private ordenImpresion = inject(OrdenImpresionService);
  private cotService = inject(CotizacionService);

  fb = inject(FormBuilder);
  cotizacionSeleccionada: any;

  listPedidos: any[] = [];
  ListOrdenImpresion: any[] = [];
  Math = Math;
  cargando = true;
  cargandoDetalle = false;
  mostrarModalModificacion = false;
  mostrarModalVisualizacion = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 0;
  estadoSeleccionado: string = 'PEDIDOS';
  pedido: any;
  pedidoSeleccionado: any;
  estadoPedidos: string = 'EN_PROCESO'

  get pedidosFiltrados(): any[] {
    const termino = this.searchTerm.trim().toLowerCase();
    if (!termino) return this.listPedidos;
    return this.listPedidos.filter(pedido =>
      [pedido.idPedido, pedido.nombreCliente, pedido.codCotizacion, pedido.estadoPedido]
        .some(valor => String(valor ?? '').toLowerCase().includes(termino))
    );
  }

  get ordenesFiltradas(): any[] {
    const termino = this.searchTerm.trim().toLowerCase();
    if (!termino) return this.ListOrdenImpresion;
    return this.ListOrdenImpresion.filter(orden =>
      [orden.nroOrden, orden.usuario?.userAcces, orden.estado]
        .some(valor => String(valor ?? '').toLowerCase().includes(termino))
    );
  }


  ngOnInit(): void {
    this.loadPedidos();
  }

  cambiarEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.currentPage = 1;
    this.searchTerm = '';

    if (estado === 'PEDIDOS') {
      this.loadPedidos();
    } else if (estado === 'ORDENES') {
      this.loadOrdenImpresion();
    }
  }

  loadPedidos(page: number = 1) {
    this.cargando = true;
    this.pedidoService.listarPedidos(
      page - 1,
      this.pageSize,
      'idPedido',
      'asc',
      this.estadoPedidos 
    ).subscribe({
      next: (data) => {
        this.listPedidos = data.content;
        console.log('Pedidos:', this.listPedidos);
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.cargando = false;
        this.currentPage = data.number + 1;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar los pedidos');
        console.error(error);
      }
    });
  }

  loadOrdenImpresion(page: number = 1) {
    this.cargando = true;
    this.ordenImpresion.getOrdenesPaginadas(page - 1, this.pageSize).subscribe({
      next: (data) => {
        this.ListOrdenImpresion = data.content;
        console.log('Órdenes:', this.ListOrdenImpresion);
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.cargando = false;
        this.currentPage = data.number + 1;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar las órdenes de impresión');
        console.error(error);
      }
    });
  }

  loadDetallePedido(pedido: any) {
    const id = (typeof pedido === 'number') ? pedido : pedido.idPedido;
    this.pedidoService.obtenerDetallesPedido(id).subscribe({
      next: (data) => {
        this.pedido = data;
        console.log(this.pedido)
      },
      error: (err) => {
        this.notificationService.error('Error al cargar el detalle del pedido');
        console.error(err);
      }
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      if (this.estadoSeleccionado === 'PEDIDOS') {
        this.loadPedidos();
      } else {
        this.loadOrdenImpresion();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      if (this.estadoSeleccionado === 'PEDIDOS') {
        this.loadPedidos(this.currentPage - 1);
      } else {
        this.loadOrdenImpresion(this.currentPage - 1);
      }
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      if (this.estadoSeleccionado === 'PEDIDOS') {
        this.loadPedidos(this.currentPage + 1);
      } else {
        this.loadOrdenImpresion(this.currentPage + 1);
      }
    }
  }

  goToPage(page: number) {
    if (this.estadoSeleccionado === 'PEDIDOS') {
      this.loadPedidos(page);
    } else {
      this.loadOrdenImpresion(page);
    }
  }

  getPages() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  visualizarModal(pedido: any): void {
    this.cargandoDetalle = true;
    this.pedidoService.obtenerDetallesPedido(pedido.idPedido).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
        this.mostrarModalVisualizacion = true;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.notificationService.error('No se pudo cargar el detalle del pedido');
      }
    });
  }

  cerrarModalVisualizacion(): void {
    this.mostrarModalVisualizacion = false;
    this.cotizacionSeleccionada = null;
  }

  mostrarModalModificar = false;
  ordenSeleccionada: any = null;

  abrirModalModificar(orden: any): void {
    this.ordenSeleccionada = orden;
    this.mostrarModalModificar = true;
  }

  cerrarModalModificar(): void {
    this.mostrarModalModificar = false;
    this.ordenSeleccionada = null;
  }

  onOrdenModificada(): void {

    this.notificationService.show('Orden modificada exitosamente');
  }
}
