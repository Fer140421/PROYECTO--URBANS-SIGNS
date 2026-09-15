import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

export interface Cliente {
  id_cliente: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface Material {
  id_material: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  unidad_medida: string;
}

export interface DetalleCotizacion {
  id_detalle_cotizacion?: number;
  id_cotizacion?: number;
  id_material: number;
  material?: Material;
  base: number;
  altura: number;
  precio_unitario: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  private apiUrl = `${environment.API_URL}/cotizaciones`;

  private http = inject(HttpClient);

  listarCotizaciones(
    estado: string,
    codCotizacion?: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('estado', estado);

    if (codCotizacion) {
      params = params.set('codCotizacion', codCotizacion);
    }

    return this.http.get<any>(`${this.apiUrl}/listar`, { params });
  }


  obtenerCotizacionPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle/${id}`);
  }

  registrarCotizacion(request: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando cotización...');
    return this.http.post<any>(`${this.apiUrl}/registrar`, request, { context })
  }

  obtenerConfirmacionPedido(idSolicitud: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/confirmacion/${idSolicitud}`);
  }

  obtenerDetalleCotizacion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalles-cotizacion/${id}`);
  }

  modificarCotizacion(idCotizacion: number, request: any): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la cotización...');
    return this.http.put<void>(
      `${this.apiUrl}/modificar-trabajos/${idCotizacion}`,
      request,
      { withCredentials: true, context }
    );
  }

}
