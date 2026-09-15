import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { PedidoResumen, TrabajoDisponible } from '../planificacion/planificacion.service';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private apiUrl = `${environment.API_URL}/pedidos`;
  constructor(private http: HttpClient) { }

  generarPedido(request: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Generando pedido...');
    return this.http.post(`${this.apiUrl}/generar`, request, { withCredentials: true, context });
  }

  listarPedidos(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'idPedido',
    sortDir: 'asc' | 'desc' = 'asc',
    estado?: string // 👈 Parámetro opcional
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Si existe estado, lo agregamos a la URL
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<any>(`${this.apiUrl}/listPedidos`, { params });
  }


  obtenerDetallesPedido(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle-pedido/${idPedido}`);
  }

  completarPedido(id: number, request: any): Observable<any> {
    const url = `${this.apiUrl}/completar/${id}`;
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Completando pedido...');
    return this.http.put(url, request, { withCredentials: true, context });
  }

  obtenerPedidosPendientes(): Observable<PedidoResumen[]> {
    return this.http.get<PedidoResumen[]>(`${this.apiUrl}/pendientes`);
  }

  obtenerTrabajosDisponibles(idPedido: number): Observable<TrabajoDisponible[]> {
    return this.http.get<TrabajoDisponible[]>(`${this.apiUrl}/${idPedido}/trabajos-disponibles`);
  }

  obtenerFactura(idPedido: number): Observable<any> {
    const urlFacturacion = this.apiUrl.replace('/pedidos', '/facturacion');
    return this.http.get<any>(`${urlFacturacion}/pedido/${idPedido}`);
  }

  obtenerPedidosListosParaEntrega(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listos-para-entrega`, { withCredentials: true });
  }

  registrarEntregaConFoto(idPedido: number, formData: FormData): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando entrega física...');
    return this.http.post<any>(`${this.apiUrl}/${idPedido}/registrar-entrega`, formData, { withCredentials: true, context });
  }
}
