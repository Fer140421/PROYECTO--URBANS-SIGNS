import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalles-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalles-cotizacion.component.html',
  styleUrl: './detalles-cotizacion.component.css'
})
export class DetallesCotizacionComponent {
  @Input() mostrar: boolean = false;
  @Input() cotizacion: any | null = null;
  @Output() cerrar = new EventEmitter<void>();

  imagenModalUrl: string | null = null;

  cerrarModal(): void {
    this.cerrar.emit();
  }

  abrirModalImagen(url: string): void {
    this.imagenModalUrl = url;
  }

  cerrarModalImagen(): void {
    this.imagenModalUrl = null;
  }

  getClienteNombre(): string {
    return this.cotizacion?.clienteNombre || this.cotizacion?.cliente?.nombre || 'Cliente sin registrar';
  }

  getClienteTipo(): string {
    return this.cotizacion?.clienteTipo || this.cotizacion?.cliente?.tipoCliente || 'Persona Natural';
  }

  getClienteDocumento(): string {
    return this.cotizacion?.clienteDocumento || this.cotizacion?.cliente?.documento || '—';
  }

  getClienteTelefono(): string {
    return this.cotizacion?.clienteTelefono || this.cotizacion?.cliente?.telefono || '—';
  }

  getClienteCorreo(): string {
    return this.cotizacion?.clienteCorreo || this.cotizacion?.cliente?.correo || '—';
  }

  getClienteDireccion(): string {
    return this.cotizacion?.clienteDireccion || this.cotizacion?.cliente?.direccion || '—';
  }

  getTotalUnidades(): number {
    if (!this.cotizacion?.trabajos) return 0;
    return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      return total + (Number(trabajo.cantidad) || 1);
    }, 0);
  }

  getAreaTotal(): number {
    if (!this.cotizacion?.trabajos) return 0;
    return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      const area = Number(trabajo.area_total || trabajo.areaTotal) || 0;
      const cant = Number(trabajo.cantidad) || 1;
      return total + (area * cant);
    }, 0);
  }

  estaVencida(): boolean {
    if (!this.cotizacion?.fechaCaducado) return false;
    const hoy = new Date();
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    return hoy > fechaCaducidad;
  }

  diasRestantes(): number {
    if (!this.cotizacion?.fechaCaducado) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    const diferencia = fechaCaducidad.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }
}
