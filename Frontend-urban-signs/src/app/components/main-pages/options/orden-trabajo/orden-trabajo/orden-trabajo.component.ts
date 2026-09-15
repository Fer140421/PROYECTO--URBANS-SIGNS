import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { PrestamoService } from '../../../../../core/services/prestamos/prestamo.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';

@Component({
  selector: 'app-orden-trabajo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ViewToggleComponent,
    ActionIconButtonComponent,
    LoadingComponent
  ],
  templateUrl: './orden-trabajo.component.html',
  styleUrl: './orden-trabajo.component.css'
})
export class OrdenTrabajoComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  private pedidosService = inject(PedidosService);
  private prestamoService = inject(PrestamoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  cargando: boolean = false;
  filtroBusqueda: string = '';
  filtroEstado: string = 'TODOS';

  // Detalle / Ficha técnica de orden de trabajo
  mostrarModalFicha: boolean = false;
  pedidoSeleccionado: any = null;
  cargandoDetalle: boolean = false;
  herramientasPrestadas: any[] = [];
  cargandoHerramientas: boolean = false;

  fechaActual: string = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  ngOnInit(): void {
    this.cargarOrdenesTrabajo();
  }

  cargarOrdenesTrabajo(): void {
    this.cargando = true;
    this.pedidosService.listarPedidos(0, 100, 'idPedido', 'desc').subscribe({
      next: (response) => {
        this.pedidos = response?.content || response || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar órdenes de trabajo:', err);
        this.notificationService.error('Error al cargar órdenes de trabajo');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let list = [...this.pedidos];

    if (this.filtroEstado !== 'TODOS') {
      list = list.filter(p => p.estadoPedido === this.filtroEstado);
    }

    if (this.filtroBusqueda.trim()) {
      const q = this.filtroBusqueda.toLowerCase();
      list = list.filter(p =>
        (p.idPedido?.toString().includes(q)) ||
        (p.nombreCliente && p.nombreCliente.toLowerCase().includes(q)) ||
        (p.codCotizacion && p.codCotizacion.toLowerCase().includes(q))
      );
    }

    this.pedidosFiltrados = list;
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  abrirFichaTecnica(pedido: any): void {
    this.cargandoDetalle = true;
    this.mostrarModalFicha = true;
    this.pedidoSeleccionado = pedido;
    this.herramientasPrestadas = [];

    // Cargar detalle completo del pedido (con trabajos y materiales)
    this.pedidosService.obtenerDetallesPedido(pedido.idPedido).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = { ...pedido, ...detalle };
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles de la orden:', err);
        this.cargandoDetalle = false;
      }
    });

    // Cargar herramientas prestadas para este pedido
    this.cargandoHerramientas = true;
    this.prestamoService.listarPorPedido(pedido.idPedido).subscribe({
      next: (prestamos) => {
        this.herramientasPrestadas = prestamos || [];
        this.cargandoHerramientas = false;
      },
      error: (err) => {
        console.error('Error al cargar herramientas prestadas:', err);
        this.cargandoHerramientas = false;
      }
    });
  }

  cerrarFichaTecnica(): void {
    this.mostrarModalFicha = false;
    this.pedidoSeleccionado = null;
    this.herramientasPrestadas = [];
  }

  imprimirOrden(): void {
    window.print();
  }

  irAPrestarHerramientas(idPedido: number): void {
    this.router.navigate(['/home/register-prestamo'], {
      queryParams: { idPedido }
    });
  }

  irAPlanner(): void {
    this.router.navigate(['/home/seguimiento']);
  }

  getClaseEstado(estado: string): string {
    switch (estado) {
      case 'EN_TALLER':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EN_PROCESO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ENTREGADO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  }
}
