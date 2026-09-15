import { Component, inject, OnInit } from '@angular/core';
import { SesionService } from '../../../../../core/services/sesion/sesion.service';
import { SessionService } from '../../../../../core/services/session/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetalleAccesoComponent } from "../detalle-acceso/detalle-acceso.component";
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';

@Component({
  selector: 'app-accesos',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleAccesoComponent, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './accesos.component.html',
  styleUrl: './accesos.component.css'
})
export class AccesosComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  private sessionService = inject(SessionService);

  sesiones: any[] = [];
  totalElementos = 0;
  paginaActual = 0;
  tamanioPagina = 10;
  filtroEstado = 'ACTIVO';
  filtroFecha = '';
  isLoading = true;
  Math = Math;

  ngOnInit(): void {
    this.cargarSesiones();
  }

  cargarSesiones(page: number = 0): void {
    this.isLoading = true;
    this.paginaActual = page;
    this.sessionService
      .listarSesiones(page, this.tamanioPagina, this.filtroEstado, this.filtroFecha)
      .subscribe({
        next: (data) => {
          this.sesiones = data.content;
          console.log('Sesiones cargadas:', this.sesiones);
          this.totalElementos = data.totalElements;
          this.paginaActual = data.number;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar sesiones', err);
          this.isLoading = false;
        }
      });
  }

  filtrarPorEstado(): void {
    this.cargarSesiones(0);
  }

  filtrarPorFecha(): void {
    this.cargarSesiones(0);
  }

  calcularDuracion(inicio: string, fin: string): string {
    const diffMs = new Date(fin).getTime() - new Date(inicio).getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  }

  getTotalPaginas(): number {
    return Math.ceil(this.totalElementos / this.tamanioPagina);
  }

  getPaginas(): number[] {
    const totalPaginas = this.getTotalPaginas();
    const paginas: number[] = [];
    const maxPaginas = 5;

    let inicio = Math.max(0, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(totalPaginas, inicio + maxPaginas);

    if (fin - inicio < maxPaginas) {
      inicio = Math.max(0, fin - maxPaginas);
    }

    for (let i = inicio; i < fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  mostrarModalDetalle = false;
  sesionSeleccionada: number | null = null;

  abrirDetalleSesion(idSesion: number): void {
    this.sesionSeleccionada = idSesion;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.sesionSeleccionada = null;
  }

}
