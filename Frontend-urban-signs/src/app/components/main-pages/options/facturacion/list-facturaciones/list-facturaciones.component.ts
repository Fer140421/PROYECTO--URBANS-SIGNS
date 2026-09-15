import { Component, inject, Input, OnInit } from '@angular/core';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { CommonModule, IMAGE_CONFIG } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetallesCotizacionComponent } from "../../cotizaciones/detalles-cotizacion/detalles-cotizacion.component";
import { ModificarCotizacionComponent } from "../../cotizaciones/modificar-cotizacion/modificar-cotizacion.component";
import { RouterModule } from '@angular/router';
import { FacturacionService } from '../../../../../core/services/facturacion/facturacion.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';

@Component({
  selector: 'app-list-facturaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-facturaciones.component.html',
  styleUrl: './list-facturaciones.component.css'
})
export class ListFacturacionesComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';

  private facturacionService = inject(FacturacionService);

  facturas: any[] = [];
  isLoading = true;
  paginaActual = 1;
  totalPaginas = 0;
  totalItems = 0;
  pageSize = 10;
  terminoBusqueda = '';
  Math = Math;

  get facturasFiltradas(): any[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) return this.facturas;
    return this.facturas.filter(factura =>
      [factura.idPedido, factura.estado, factura.mensajesError]
        .some(valor => String(valor ?? '').toLowerCase().includes(termino))
    );
  }

  ngOnInit(): void {
    this.cargarFacturas();
  }

  goToPage(pagina: number) {
    this.paginaActual = pagina;
    this.cargarFacturas();
  }

  previousPage() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarFacturas();
    }
  }

  nextPage() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarFacturas();
    }
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      pages.push(i);
    }
    return pages;
  }

  buscar() {
    // Aquí podrías llamar a otro endpoint con búsqueda o filtrar localmente
    console.log('Buscar:', this.terminoBusqueda);
  }

  cargarFacturas() {
    this.isLoading = true;
    this.facturacionService.listarFacturas(this.paginaActual, this.pageSize)
      .subscribe(data => {
        this.facturas = data.content;
        this.totalPaginas = data.totalPages;
        this.totalItems = data.totalElements;
        this.isLoading = false;
      });
  }

  visualizarModal(factura: any) {
    console.log('Detalles factura:', factura);
    // Podrías mostrar jsonEnviado y jsonRecibido
  }

  imprimirFactura(urlQr: string) {
    window.open(urlQr, '_blank');
  }

}
