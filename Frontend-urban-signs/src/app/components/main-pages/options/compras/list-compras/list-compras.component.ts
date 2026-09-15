import { Component, inject, OnInit } from '@angular/core';
import { CompraService } from '../../../../../core/services/compras/compra.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { SupplierService } from '../../../../../core/services/supplier/supplier.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { UnidadMedidaService } from '../../../../../core/services/unidadMedida/unidad-medida.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { HasPermissionDirective } from '../../../../../shared/directives/has-permission.directive';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-compras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, LoadingComponent, ViewToggleComponent,
    HasPermissionDirective, ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-compras.component.html',
  styleUrl: './list-compras.component.css'
})
export class ListComprasComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  compras: any[] = [];
  isLoading = true;
  isProcessing = false;
  comprasService = inject(CompraService)
  notificacion = inject(NotificationService);
  materialService = inject(MaterialProduccionService);
  unidadService = inject(UnidadMedidaService);
  proveedorService = inject(SupplierService);
  estadoSeleccionado: string = 'PENDIENTE';
  comprasFiltradas: any[] = [];
  detalles: any[] = [];
  proveedor: string = '';
  fechaCompra: string = new Date().toISOString().split('T')[0];

  isCompraModalOpen = false;
  productoSeleccionadoId: number | null = null;
  cantidad: number = 1;
  precioUnitario: number = 0;
  unidadMedida: string = '';
  listProveedores: any[] = [];
  listMateriales: any[] = [];
  listUnidad: any[] = [];
  isConfirmModalOpen: boolean = false;
  precioVenta: number = 0;
  xCompra: any;

  idCompra?: number;
  idProveedor?: number;
  unidadSeleccionadaModal: string = '';
  tipoControlSeleccionadoModal: string = '';
  Math = Math;
  currentPage = 1;
  totalItems = 0;
  page = 0;
  pageSize = 5;
  totalPages = 0;
  det = false
  isDeleteModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  compraSeleccionada: any = null;
  ordenSeleccionada: any = null;
  comprasFiltra: any[] = [];


  ngOnInit(): void {
    this.cargarCompras();
    this.cargarProductos();
    this.loadProveedor();
  }

  cargarCompras() {
    this.isLoading = true;
    this.comprasService.listarCompras(
      this.estadoSeleccionado,
      this.idCompra,
      this.idProveedor,
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.compras = data.content;
        console.log(this.compras)
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar compras', err);
        this.isLoading = false;
      }
    });
  }

  loadProveedor() {
    this.proveedorService.getSuppliers().subscribe((data: any) => {
      this.listProveedores = data;
    });
  }

  modalMod(compra: any) {
    this.isCompraModalOpen = true;
    this.idCompra = compra.idCompra;
    this.detalles = (compra.detalles || []).map((det: any) => {
      const material = this.listMateriales.find(m => m.idMaterial === det.idMaterial);
      return {
        productoId: det.idMaterial,
        nombreProducto: material ? `${material.nombre} ${material.caracteristica || ''}` : 'Desconocido',
        cantidad: det.cantidad,
        unidadMedida: material?.unidad?.abreviatura || '',
        tipoControl: material?.tipoControl || '',
        precioUnitario: det.precioUnitario,
        subtotal: det.subtotal
      };
    });
    this.proveedor = compra.idSupplier;
    this.fechaCompra = compra.fechaCompra || new Date().toISOString().split('T')[0];
    if (this.detalles.length > 0) {
      this.onSeleccionarProductoModal();
    } else {
      this.productoSeleccionadoId = null;
      this.unidadSeleccionadaModal = '';
      this.tipoControlSeleccionadoModal = '';
    }

    this.loadProveedor();
    this.cargarProductos();
  }


  closeCompraModal() {
    this.isCompraModalOpen = false;
    this.detalles = [];
    this.proveedor = '';
    this.fechaCompra = new Date().toISOString().split('T')[0];
    this.estadoSeleccionado = 'PENDIENTE';
    this.productoSeleccionadoId = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
    this.unidadMedida = '';
  }

  eliminarProducto(index: number) {
    this.detalles.splice(index, 1);
  }

  filtrarCompras() {
    this.cargarCompras();
  }

  cambiarEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.filtrarCompras();
  }

  // Abrir modal
  abrirModal(compra: any) {
    this.det = true;
    this.compraSeleccionada = compra;
  }

  // Cerrar modal
  cerrarModal() {
    this.compraSeleccionada = null;
    this.det = false;
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.listMateriales.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Desconocido';
  }

  cargarProductos() {
    this.materialService.getSimpleMateriales().subscribe(data => {
      this.listMateriales = data;
      console.log(this.listMateriales)
    });
  }

  modificarCompra() {
    if (this.isProcessing) return;

    if (!this.proveedor || this.detalles.length === 0) {
      this.notificacion.error('Debe seleccionar un proveedor y agregar al menos un producto.');
      return;
    }

    if (!this.idCompra) {
      this.notificacion.error('No se ha seleccionado la compra a modificar.');
      return;
    }
    const dto = {
      idProveedor: this.proveedor,
      observaciones: '',
      detalles: this.detalles.map(d => ({
        idMaterial: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        ubicacion: ''
      }))
    };

    // Llamar al servicio Angular
    this.isProcessing = true;
    this.comprasService.modificarCompra(this.idCompra, dto).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificacion.show('Compra modificada correctamente', 'success');
        this.closeCompraModal();
        this.cargarCompras();
      },
      error: (err) => {
        console.error('Error al modificar compra', err);
        const mensaje = err.error?.message || 'Error al modificar la compra';
        this.notificacion.error(mensaje);
      }
    });
  }


  agregarProducto() {
    if (!this.productoSeleccionadoId || this.cantidad <= 0 || this.precioUnitario <= 0) return;

    const total = this.cantidad * this.precioUnitario;
    this.detalles.push({
      productoId: this.productoSeleccionadoId,
      cantidad: this.cantidad,
      unidadMedida: this.unidadMedida || '',
      precioUnitario: this.precioUnitario,
      total
    });

    this.productoSeleccionadoId = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
  }

  // Abrir modal
  openDeleteModal(orden: any) {
    if (this.isProcessing) return;

    this.ordenSeleccionada = orden;
    this.isDeleteModalOpen = true;
  }

  // Cerrar modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.ordenSeleccionada = null;
  }


  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  confirmarCompra() {
    if (this.isProcessing) return;
    if (!this.compraSeleccionada) return;

    // Validar que haya al menos un detalle activo
    const detallesActivos = this.compraSeleccionada.detalles.filter((d: any) => !d.eliminado);
    if (detallesActivos.length === 0) {
      this.notificacion.error('Debe tener al menos un producto para confirmar la compra');
      return;
    }

    // Confirmar acción
    if (!confirm('¿Está seguro de confirmar esta compra? Se actualizará el inventario.')) {
      return;
    }

    // Construir DTO
    const confirmarDTO = {
      detalles: detallesActivos.map((d: any) => ({
        idMaterial: d.idMaterial,
        cantidad: d.cantidadEditada,
        precioUnitario: d.precioEditado,
        ubicacion: d.ubicacionEditada || 'Sin ubicación'
      }))
    };

    console.log('Confirmando compra:', confirmarDTO);

    // Enviar al backend
    this.isProcessing = true;
    this.comprasService.confirmarCompra(this.compraSeleccionada.idCompra, confirmarDTO).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response) => {
        this.notificacion.show('Compra confirmada exitosamente. Inventario actualizado.', 'success');
        console.log('Compra confirmada:', response);
        this.closeConfirmModal();
        this.cargarCompras();
      },
      error: (err) => {
        console.error('Error al confirmar compra:', err);
        const errorMessage = err.error?.message || 'Error al confirmar la compra';
        this.notificacion.error(errorMessage);
      }
    });
  }

  eliminarDetalle(index: number) {
    this.compraSeleccionada.detalles.splice(index, 1);
    this.compraSeleccionada.total = this.compraSeleccionada.detalles
      .reduce((acc: number, d: any) => acc + (d.subtotal || 0), 0);
  }

  todosTienenPrecioVenta() {
    return this.compraSeleccionada.detalles.every((det: any) => det.precioVenta > 0);
  }

  onCancelarCompra() {
    if (this.isProcessing || !this.ordenSeleccionada) return;

    this.isProcessing = true;
    this.comprasService.cancelarCompra(this.ordenSeleccionada.idCompra).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (compraCancelada) => {
        this.notificacion.success('La orden de compra de ha cancelado exitosamente.');
        this.closeDeleteModal();
        this.cargarCompras();
      },
      error: (err) =>
        this.notificacion.error('Error al cancelar la orden de compra.')
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarCompras();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarCompras();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.cargarCompras();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openConfirmModal(compra: any) {
    console.log(compra)
    if (compra.estado !== 'PENDIENTE') {
      this.notificacion.error('Solo se pueden confirmar compras en estado PENDIENTE');
      return;
    }
    this.compraSeleccionada = JSON.parse(JSON.stringify(compra));
    if (!this.compraSeleccionada.detalles) {
      this.compraSeleccionada.detalles = [];
    }
    this.compraSeleccionada.detalles = this.compraSeleccionada.detalles.map((d: any) => {
      const material = d.material || {}; // Si no hay material, usar objeto vacío
      const unidad = material.unidad || {}; // Evitar errores si no hay unidad

      return {
        idDetalleCompra: d.idDetalleCompra || null,
        idMaterial: d.idMaterial || material.idMaterial || null,
        nombreMaterial: `${material.nombre || d.nombreMaterial || 'Sin nombre'} ${material.caracteristica || ''}`.trim(),
        tipoControl: material.tipoControl || 'SIN CONTROL',
        cantidad: d.cantidad || 0,
        cantidadEditada: d.cantidad || 0,
        unidadMedida: unidad.abreviatura || '—',
        precioUnitario: d.precioUnitario || 0,
        precioEditado: d.precioUnitario || 0,
        subtotal: d.subtotal || 0,
        ubicacion: d.ubicacion || 'Sin ubicación',
        ubicacionEditada: d.ubicacion || '',
        eliminado: false
      };
    });

    this.isConfirmModalOpen = true;
  }

  marcarComoEliminado(index: number) {
    if (confirm('¿Está seguro de eliminar este producto de la compra?')) {
      this.compraSeleccionada.detalles[index].eliminado = true;
      this.recalcularTotal();
    }
  }

  /**
   * ✨ NUEVO: Restaura un detalle eliminado
   */
  restaurarDetalle(index: number) {
    this.compraSeleccionada.detalles[index].eliminado = false;
    this.recalcularTotal();
  }

  /**
   * ✨ NUEVO: Actualiza cantidad o precio
   */
  actualizarDetalle(detalle: any) {
    detalle.subtotal = detalle.cantidadEditada * detalle.precioEditado;
    this.recalcularTotal();
  }

  /**
   * ✨ NUEVO: Recalcula el total de la compra
   */
  recalcularTotal() {
    if (!this.compraSeleccionada) return;

    this.compraSeleccionada.total = this.compraSeleccionada.detalles
      .filter((d: any) => !d.eliminado)
      .reduce((sum: number, d: any) => sum + (d.cantidadEditada * d.precioEditado), 0);
  }

  imprimirCompra(compra: any) {
    if (!compra) return;

    const proveedorNombre = compra.proveedor ?
      `${compra.proveedor.people.name_people} ${compra.proveedor.people.ap} ${compra.proveedor.people.am}` :
      'Desconocido';

    const html = `
      <html>
        <head>
          <title>Orden de Compra #${compra.idCompra}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .info { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f7f7f7; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Orden de Compra #${compra.idCompra}</h1>
          <div class="info">
            <p><strong>Proveedor:</strong> ${proveedorNombre}</p>
            <p><strong>Fecha:</strong> ${new Date(compra.fecha).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${compra.estado}</p>
            ${compra.observaciones ? `<p><strong>Observaciones:</strong> ${compra.observaciones}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${compra.detalles.map((d: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${d.material.nombre} ${d.material.caracteristica || ''}</td>
                  <td>${d.cantidad} ${d.material.unidad.abreviatura}</td>
                  <td>Bs ${d.precioUnitario.toFixed(2)}</td>
                  <td>Bs ${d.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p class="total">TOTAL: Bs ${compra.total.toFixed(2)}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }

  onSeleccionarProductoModal() {
    const prod = this.listMateriales.find(p => p.idMaterial === this.productoSeleccionadoId);
    if (prod) {
      this.unidadSeleccionadaModal = prod.unidad?.abreviatura || '';
      this.tipoControlSeleccionadoModal = prod.tipoControl || '';
    } else {
      this.unidadSeleccionadaModal = '';
      this.tipoControlSeleccionadoModal = '';
    }
  }

  agregarProductoModal() {
    if (!this.productoSeleccionadoId || this.cantidad <= 0 || this.precioUnitario <= 0) return;

    const prod = this.listMateriales.find(p => p.idMaterial === this.productoSeleccionadoId);
    if (!prod) return;

    const total = this.cantidad * this.precioUnitario;

    this.detalles.push({
      productoId: prod.idMaterial,
      nombreProducto: `${prod.nombre} ${prod.caracteristica || ''}`,
      cantidad: this.cantidad,
      unidadMedida: prod.unidad?.abreviatura || '',
      tipoControl: prod.tipoControl || '',
      precioUnitario: this.precioUnitario,
      total
    });

    // Limpiar campos
    this.productoSeleccionadoId = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
    this.unidadSeleccionadaModal = '';
    this.tipoControlSeleccionadoModal = '';
  }

  get totalDetalles(): number {
    return this.detalles.reduce((sum, d) => sum + d.subtotal, 0);
  }

}
