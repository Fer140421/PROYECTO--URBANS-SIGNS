import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cotizacion'] && this.cotizacion) {
      console.log('Cotización cargada:', this.cotizacion);
    }
  }

  /**
   * Obtiene el costo total de todos los trabajos
   */
  getCostoTotal(): number {
    if (!this.cotizacion?.trabajos) return 0;
    return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      return total + (trabajo.subtotal || 0);
    }, 0);
  }
  /**
   * Obtiene el total de materiales usados en todos los trabajos
   */
  getTotalMateriales(): number {
    if (!this.cotizacion?.trabajos) return 0;
    return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      if (!trabajo.materiales) return total;
      return total + trabajo.materiales.length;
    }, 0);
  }

  /**
   * Calcula el costo total de materiales
   */
  getCostoTotalMateriales(): number {
    if (!this.cotizacion?.trabajos) return 0;
    let total = 0;
    this.cotizacion.trabajos.forEach((trabajo: any) => {
      if (trabajo.materiales && trabajo.materiales.length > 0) {
        trabajo.materiales.forEach((material: any) => {
          total += (material.cantidad || 0) * (material.precioUnitario || 0);
        });
      }
    });
    return total;
  }

  /**
   * Formatea una fecha al formato dd/MM/yyyy
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Verifica si la cotización está vencida
   */
  estaVencida(): boolean {
    if (!this.cotizacion?.fechaCaducado) return false;
    const hoy = new Date();
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    return hoy > fechaCaducidad;
  }

  /**
   * Calcula los días restantes hasta la caducidad
   */
  diasRestantes(): number {
    if (!this.cotizacion?.fechaCaducado) return 0;
    const hoy = new Date();
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    const diferencia = fechaCaducidad.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }  
}
