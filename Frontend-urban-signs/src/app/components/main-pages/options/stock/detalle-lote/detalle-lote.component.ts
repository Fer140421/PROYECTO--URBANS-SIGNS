import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModificarSobranteComponent } from "../../sobrantes/modificar-sobrante/modificar-sobrante.component";
import { SobrantesService } from '../../../../../core/services/sobrantes/sobrantes.service';

@Component({
  selector: 'app-detalle-lote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ModificarSobranteComponent],
  templateUrl: './detalle-lote.component.html',
  styleUrl: './detalle-lote.component.css'
})
export class DetalleLoteComponent {
  @Input() mostrar: boolean = false;
  @Input() material: any | null = null;
  @Input() residuos: any[] = []; // Recibir residuos desde el componente padre

  @Output() cerrar = new EventEmitter<void>();
  mostrarModalModificacion = false;
  residuoSeleccionado: any = null;
  @Output() modificarResiduo = new EventEmitter<any>();
  private residuoService = inject(SobrantesService);
  totalResiduos: number = 0;

  ngOnInit(): void {

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['material'] && this.material) {
      console.log('Material cargado:', this.material);


    }
  }


  getStockTotal(): number {
    if (!this.material?.lotes) return 0;
    return this.material.lotes
      .filter((lote: any) => lote.activo)
      .reduce((total: number, lote: any) => total + (lote.cantidadActual || 0), 0);
  }

  getTotalLotes(): number {
    if (!this.material?.lotes) return 0;
    return this.material.lotes.filter((lote: any) => lote.activo).length;
  }

  getCantidadConsumida(lote: any): number {
    if (!lote) return 0;
    return (lote.cantidadInicial || 0) - (lote.cantidadActual || 0);
  }

  getPorcentajeConsumo(lote: any): number {
    if (!lote || !lote.cantidadInicial) return 0;
    const consumido = this.getCantidadConsumida(lote);
    return (consumido / lote.cantidadInicial) * 100;
  }

  stockBajo(): boolean {
    if (!this.material) return false;
    return this.getStockTotal() < (this.material.stockMinimo || 0);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  getClaseEstadoLote(lote: any): string {
    if (!lote.activo) return 'badge bg-secondary';
    const porcentaje = this.getPorcentajeConsumo(lote);
    if (porcentaje >= 90) return 'badge bg-danger';
    if (porcentaje >= 70) return 'badge bg-warning';
    return 'badge bg-success';
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  // Variable para controlar la tab activa
  tabActiva: string = 'lotes'; // 'lotes', 'residuos', 'todo'


  // Nuevas funciones para la UI
  getStockResiduos(): number {
    return this.residuos
      .filter(r => r.estado === 'DISPONIBLE')
      .reduce((total, r) => total + r.cantidad, 0);
  }

  getResiduosDisponibles(): number {
    return this.residuos.filter(r => r.estado === 'DISPONIBLE').length;
  }

  getMensajeContextual(): string {
    if (this.tabActiva === 'lotes') {
      return 'Los lotes inactivos no están disponibles para producción';
    } else if (this.tabActiva === 'residuos') {
      return 'Los residuos reutilizables ayudan a optimizar el uso de materiales y reducir costos';
    } else {
      return 'Gestione todos sus recursos materiales desde esta vista integrada';
    }
  }

  abrirModalModificacion(residuo: any): void {
    this.residuoSeleccionado = residuo;
    this.mostrarModalModificacion = true;
    console.log('Abrir modal de modificación para residuo:', residuo);
  }

  cerrarModalModificacion(): void {
    this.mostrarModalModificacion = false;
    this.residuoSeleccionado = null;
  }

  onResiduoActualizado(): void {
    this.cerrarModalModificacion();
    console.log('Residuo actualizado, recargar datos...');
  }
}