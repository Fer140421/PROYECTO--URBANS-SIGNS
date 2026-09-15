import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ver-detalles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ver-detalles.component.html',
  styleUrl: './ver-detalles.component.css'
})
export class VerDetallesComponent {
  private router = inject(Router);
  @Input() mostrar: boolean = false;
  @Input() pedido: any | null = null;
  @Output() cerrar = new EventEmitter<void>();

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedido'] && this.pedido) {
      console.log('Pedido cargado:', this.pedido);
    }
  }

  /**
   * Obtiene el costo total del pedido
   */
  getCostoTotal(): number {
    return this.pedido?.totalPedido || 0;
  }

  /**
   * Obtiene el total de materiales (detalles) usados en todos los trabajos
   */
  getTotalMateriales(): number {
    if (!this.pedido?.cotizacion?.trabajos) return 0;
    return this.pedido.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      if (!trabajo.detalles) return total;
      return total + trabajo.detalles.length;
    }, 0);
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
    if (!this.pedido?.cotizacion?.fechaCaducado) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.pedido.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    return hoy > fechaCaducidad;
  }

  /**
   * Calcula los días restantes hasta la caducidad
   */
  diasRestantes(): number {
    if (!this.pedido?.cotizacion?.fechaCaducado) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.pedido.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    const diferencia = fechaCaducidad.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Obtiene el porcentaje de pago realizado
   */
  getPorcentajePagado(): number {
    if (!this.pedido?.totalPedido || this.pedido.totalPedido === 0) return 0;
    return (this.pedido.anticipo / this.pedido.totalPedido) * 100;
  }

  getEtapaActual(): number {
    const est = this.pedido?.estadoPedido;
    switch (est) {
      case 'ENTREGADO': return 5;
      case 'FINALIZADO': return 4;
      case 'EN_TALLER': return 3;
      case 'EN_PROCESO': return 2;
      case 'PENDIENTE': return 1;
      default: return 1;
    }
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }

  irAPrestarHerramientas(): void {
    const id = this.pedido?.idPedido;
    this.cerrarModal();
    this.router.navigate(['/home/register-prestamo'], {
      queryParams: { idPedido: id }
    });
  }
}
