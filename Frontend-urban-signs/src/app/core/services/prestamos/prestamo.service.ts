import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl = `${environment.API_URL}/prestamos`;
  constructor(private http: HttpClient) { }

  registrarPrestamo(dto: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando préstamo...');
    return this.http.post(`${this.apiUrl}/registrar`, dto, { withCredentials: true, context });
  }

  listPrestamos(
    estado?: string,
    tipoPrestamo?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (estado) {
      params = params.set('estado', estado);
    }

    if (tipoPrestamo) {
      params = params.set('tipoPrestamo', tipoPrestamo);
    }

    return this.http.get<any>(`${this.apiUrl}/listPrestamos`, {
      params,
      withCredentials: true
    });
  }

  modificarPrestamo(idPrestamo: number, dto: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del préstamo...');
    return this.http.put<any>(`${this.apiUrl}/modificar/${idPrestamo}`, dto, { withCredentials: true, context });
  }

  registrarDevolucion(idPrestamo: number, observacion: string): Observable<any> {
    const params = new HttpParams().set('observacion', observacion);
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando devolución de herramientas...');
    return this.http.put<any>(`${this.apiUrl}/devolucion/${idPrestamo}`, null, { params, withCredentials: true, context });
  }

  listarPorPedido(idPedido: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-pedido/${idPedido}`, { withCredentials: true });
  }
}
