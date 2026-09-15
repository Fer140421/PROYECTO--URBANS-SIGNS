import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../../../core/services/stock/stock.service';
import { StockDisponible } from '../../../../../core/models/stock/stockDisponible.model';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { MaterialStatsDTO } from '../../../../../core/models/MaterialProduccion/materialDatos.model';
import { DetalleLoteComponent } from "../detalle-lote/detalle-lote.component";
import { LoteServiceService } from '../../../../../core/services/loteService/lote-service.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { ModificarSobranteComponent } from "../../sobrantes/modificar-sobrante/modificar-sobrante.component";
import { SobrantesService } from '../../../../../core/services/sobrantes/sobrantes.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';

@Component({
  selector: 'app-list-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, DetalleLoteComponent, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-stock.component.html',
  styleUrl: './list-stock.component.css'
})
export class ListStockComponent implements OnInit {
  private stockService = inject(StockService);
  private categoriaService = inject(CategoryService);
  private materialService = inject(MaterialProduccionService);
  private loteService = inject(LoteServiceService);
  private notificacionService = inject(NotificationService);
  private residuoService = inject(SobrantesService);
  stock: StockDisponible[] = [];
  listCategorias: any[] = [];
  Math = Math;
  cargando = true;
  cargandoDetalle = false;
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  itemsPerPage = 5;
  searchTerm: string = '';
  viewMode: 'list' | 'cards' = 'list';
  stats: any = {};
  mostrarModalModificacion = false;
  materialSeleccionado: any;
  sobranteSeleccionado: any[] = [];
  mostrarModalVisualizacion = false;


  ngOnInit(): void {
    this.loadStock();
    this.loadCategorias();
    this.loadStats();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadStock();
  }

  loadStock(): void {
    this.cargando = true;
    this.stockService.listarStock(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.stock = response.content;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar el stock', err);
        this.cargando = false;
      }
    });
  }

  loadCategorias(): void {
    this.categoriaService.getSimpleCategories().subscribe({
      next: (data) => {
        this.listCategorias = data;
        console.log('Categorías cargadas:', data);
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStock();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadStock();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadStock();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  setViewMode(mode: 'list' | 'cards') {
    this.viewMode = mode;
  }

  searchStock(): void {
    this.currentPage = 0;

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadStock();
    } else {
      this.loadStock();
    }
  }

  loadStats(): void {
    this.materialService.getMaterialStats().subscribe({
      next: (data: MaterialStatsDTO) => {
        this.stats = data;
      },
      error: (err) => console.error('Error al cargar estadísticas:', err)
    });
  }

  cerrarModalVisualizacion(): void {
    this.mostrarModalVisualizacion = false;
    this.materialSeleccionado = null;
  }

  visualizarLotes(lote: any): void {
    this.loteService.getLotes(lote.idMaterial).subscribe({
      next: (detalle) => {
        this.materialSeleccionado = detalle;
        this.mostrarModalVisualizacion = true;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }

  abrirModal(material: any): void {
    this.mostrarModalVisualizacion = true;
    this.cargandoDetalle = true;
    this.visualizarLotes(material);
    this.visualizarResiduos(material);
  }

  visualizarResiduos(lote: any): void {
    this.residuoService.listarPorMaterial(lote.idMaterial, 0, 10).subscribe({
      next: (detalle) => {
        this.sobranteSeleccionado = detalle.content;
        this.mostrarModalVisualizacion = true;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.notificacionService.error('No se pudo cargar el detalle de la solicitud');
      }
    });
  }




}
