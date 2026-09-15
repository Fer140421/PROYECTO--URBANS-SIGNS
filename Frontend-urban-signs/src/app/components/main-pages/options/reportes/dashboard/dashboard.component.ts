import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentDate: Date = new Date();

  // ✅ Métricas principales
  metricas: any = {
    totalPedidos: 0,
    ventasTotales: 0,
    clientesActivos: 0,
    stockCritico: 0
  };

  // ✅ Estado de pedidos
  estadoPedidos: any = {
    pendientes: 0,
    enProceso: 0,
    finalizados: 0,
    entregados: 0
  };

  // ✅ Materiales con stock bajo
  lowStockMaterials: any[] = [];

  // ✅ Próximas entregas
  upcomingDeliveries: any[] = [];

  // ✅ Top clientes
  topClients: any[] = [];

  // ✅ Actividad reciente
  recentActivities: any[] = [];

  // ✅ Métricas de producción
  metricasProduccion: any = {
    ordenesImpresion: 0,
    trabajosProgramados: 0,
    herramientasEnUso: 0,
    tiempoPromedio: 0
  };

  // ✅ Loading states
  loading = {
    metricas: true,
    estadoPedidos: true,
    stockBajo: true,
    entregas: true,
    clientes: true,
    actividades: true,
    produccion: true
  };

  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.cargarTodosLosDatos();
  }

  cargarTodosLosDatos(): void {
    this.cargarMetricasPrincipales();
    this.cargarEstadoPedidos();
    this.cargarMaterialesStockBajo();
    this.cargarProximasEntregas();
    this.cargarTopClientes();
    this.cargarMetricasProduccion();
  }

  cargarMetricasPrincipales(): void {
    this.loading.metricas = true;
    this.dashboardService.getMetricasPrincipales().subscribe({
      next: (data: any) => {
        this.metricas = data;
        this.loading.metricas = false;
      },
      error: (err: any) => {
        console.error('Error cargando métricas principales', err);
        this.loading.metricas = false;
      }
    });
  }

  cargarEstadoPedidos(): void {
    this.loading.estadoPedidos = true;
    this.dashboardService.getEstadoPedidos().subscribe({
      next: (data: any) => {
        this.estadoPedidos = data;
        this.loading.estadoPedidos = false;
      },
      error: (err: any) => {
        console.error('Error cargando estado de pedidos', err);
        this.loading.estadoPedidos = false;
      }
    });
  }

  cargarMaterialesStockBajo(): void {
    this.loading.stockBajo = true;
    this.dashboardService.getMaterialesStockBajo().subscribe({
      next: (data: any[]) => {
        this.lowStockMaterials = data;
        this.loading.stockBajo = false;
      },
      error: (err: any) => {
        console.error('Error cargando materiales con stock bajo', err);
        this.loading.stockBajo = false;
      }
    });
  }

  cargarProximasEntregas(): void {
    this.loading.entregas = true;
    this.dashboardService.getProximasEntregas().subscribe({
      next: (data: any[]) => {
        this.upcomingDeliveries = data;
        this.loading.entregas = false;
      },
      error: (err: any) => {
        console.error('Error cargando próximas entregas', err);
        this.loading.entregas = false;
      }
    });
  }

  cargarTopClientes(): void {
    this.loading.clientes = true;
    this.dashboardService.getTopClientes().subscribe({
      next: (data: any[]) => {
        this.topClients = data;
        this.loading.clientes = false;
      },
      error: (err: any) => {
        console.error('Error cargando top clientes', err);
        this.loading.clientes = false;
      }
    });
  }

  cargarMetricasProduccion(): void {
    this.loading.produccion = true;
    this.dashboardService.getMetricasProduccion().subscribe({
      next: (data: any) => {
        this.metricasProduccion = data;
        this.loading.produccion = false;
      },
      error: (err: any) => {
        console.error('Error cargando métricas de producción', err);
        this.loading.produccion = false;
      }
    });
  }

  recargarDashboard(): void {
    this.cargarTodosLosDatos();
  }
}