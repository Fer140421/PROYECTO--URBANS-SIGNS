import { Component, inject } from '@angular/core';
import { CompraService } from '../../../../../core/services/compras/compra.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../../../../core/services/supplier/supplier.service';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { UnidadMedidaService } from '../../../../../core/services/unidadMedida/unidad-medida.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-registrar-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-compra.component.html',
  styleUrl: './registrar-compra.component.css'
})
export class RegistrarCompraComponent {
  isProcessing = false;
  comprasService = inject(CompraService);
  materialService = inject(MaterialProduccionService);
  notificacion = inject(NotificationService);
  proveedorService = inject(SupplierService);
  unidadService = inject(UnidadMedidaService);
  router = inject(Router)
  productos: any[] = [];
  detalles: any[] = [];

  proveedor: string = '';
  fechaCompra: string = new Date().toISOString().split('T')[0];
  estado: string = 'Pendiente';
  unidadSeleccionada: string = '';
  tipoControlSeleccionado: string = '';
  observaciones: string = '';
  productoSeleccionadoId: number | null = null;
  cantidad: number = 1;
  precioUnitario: number = 0;
  unidadMedida: string = '';
  listProveedores: any[] = [];
  listUnidades: any[] = [];
  proveedorSeleccionadoId?: number;
  ubicacion: string = '';

  ngOnInit() {
    this.cargarProductos();
    this.loadProveedor();
    this.loadUnidades();
  }

  loadProveedor() {
    this.proveedorService.getSuppliers().subscribe((data: any) => {
      this.listProveedores = data;
      console.log(this.listProveedores);
    });
  }

  loadUnidades() {
    this.unidadService.listarAll().subscribe(data => {
      this.listUnidades = data;
    });
  }

  cargarProductos() {
    this.materialService.getSimpleMateriales().subscribe((data: any) => {
      this.productos = data;
      console.log(this.productos)
    });
  }


  onSeleccionarProducto() {
    const prod = this.productos.find(p => p.idMaterial === this.productoSeleccionadoId);
    if (prod) {
      this.unidadSeleccionada = prod.unidad?.abreviatura || '';
      this.tipoControlSeleccionado = prod.tipoControl || '';
    } else {
      this.unidadSeleccionada = '';
      this.tipoControlSeleccionado = '';
    }
  }

  obtenerNombreProducto(id: number) {
    const prod = this.productos.find(p => p.id === id);
    return prod ? prod.nombre : 'Desconocido';
  }

  obtenerUnidadMedida(id: number): string {
    const unidad = this.listUnidades.find(u => u.idUnidad === id);
    return unidad ? unidad.abreviatura : '';
  }

  agregarProducto() {
    if (!this.productoSeleccionadoId) {
      this.notificacion.error('Seleccione un producto');
      return;
    }
    if (this.cantidad <= 0) {
      this.notificacion.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (this.precioUnitario <= 0) {
      this.notificacion.error('El precio unitario debe ser mayor a 0');
      return;
    }

    const prod = this.productos.find(p => p.idMaterial === this.productoSeleccionadoId);
    if (!prod) return;

    const total = this.cantidad * this.precioUnitario;

    this.detalles.push({
      productoId: prod.idMaterial,
      nombreProducto: `${prod.nombre} ${prod.caracteristica || ''}`,
      cantidad: this.cantidad,
      unidadMedida: prod.unidad?.abreviatura || '',
      tipoControl: prod.tipoControl || '',
      precioUnitario: this.precioUnitario,
      total: total,
      ubicacion: this.ubicacion || 'Sin ubicación'
    });

    this.productoSeleccionadoId = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
    this.ubicacion = '';
    this.unidadSeleccionada = '';
    this.tipoControlSeleccionado = '';
  }

  eliminarProducto(index: number) {
    this.detalles.splice(index, 1);
  }

  calcularTotalCompra(): number {
    return this.detalles.reduce((sum, d) => sum + d.total, 0);
  }

  registrarCompra() {
    if (this.isProcessing) return;

    if (!this.proveedorSeleccionadoId) {
      this.notificacion.error('Seleccione un proveedor');
      return;
    }

    if (this.detalles.length === 0) {
      this.notificacion.error('Agregue al menos un producto');
      return;
    }

    // Construir el objeto de compra
    const compra = {
      idProveedor: this.proveedorSeleccionadoId,
      observaciones: this.observaciones || '',
      detalles: this.detalles.map(d => ({
        idMaterial: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        ubicacion: d.ubicacion
      }))
    };

    console.log('Orden de compra a enviar:', compra);

    this.isProcessing = true;
    this.comprasService.crearCompra(compra).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response: any) => {
        this.notificacion.show(
          'Orden de compra creada exitosamente (Estado: PENDIENTE)',
          'success'
        );
        console.log('Compra creada:', response);
        this.router.navigate(['/home/list-compras']);
      },
      error: (err) => {
        console.error('Error al registrar compra:', err);
        const errorMessage = err.error?.message || 'Error al registrar la compra';
        this.notificacion.error(errorMessage);
      }
    });
  }

  resetForm() {
    if (this.isProcessing) return;

    this.notificacion.show('Registro de compra cancelado', 'info');
    this.router.navigate(['/home/list-compras']);
  }

}
