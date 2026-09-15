import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.API_URL}/dashboard`;
  private http = inject(HttpClient);

  getMetricasPrincipales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metricas-principales`);
  }

  getEstadoPedidos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estado-pedidos`);
  }

  getMaterialesStockBajo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/materiales-stock-bajo`);
  }

  getProximasEntregas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/proximas-entregas`);
  }

  getTopClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-clientes`);
  }

  getMetricasProduccion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metricas-produccion`);
  }

}