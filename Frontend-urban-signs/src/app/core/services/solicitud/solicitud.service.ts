import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { catchError, Observable, throwError } from 'rxjs';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private apiUrl = `${environment.API_URL}/solicitudes`;
  constructor(private http: HttpClient) { }

  registrarSolicitud(solicitud: any, file?: File | null): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando solicitud de cotización...');
    if (file) {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(solicitud)], { type: 'application/json' }));
      formData.append('file', file);
      return this.http.post<any>(`${this.apiUrl}/registrar`, formData, { context })
        .pipe(
          catchError(error => {
            return throwError(() => new Error('Error al registrar la solicitud.'));
          })
        );
    }
    return this.http.post<any>(`${this.apiUrl}/registrar`, solicitud, { context })
      .pipe(
        catchError(error => {
          return throwError(() => new Error('Error al registrar la solicitud.'));
        })
      );
  }
  listarSolicitudes(
    page: number,
    size: number,
    estado: string,
    codSolicitud?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('estado', estado);

    if (codSolicitud) {
      params = params.set('codSolicitud', codSolicitud);
    }

    return this.http.get<any>(`${this.apiUrl}/listar`, { params });
  }

  getSolicitudDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle/${id}`);
  }

  actualizarSolicitud(id: number, request: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la solicitud...');
    return this.http.put<any>(`${this.apiUrl}/modificar/${id}`, request, { context });
  }

  obtenerDetalle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/det-mod/${id}`);
  }

  modificarSolicitud(id: number, request: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la solicitud...');
    return this.http.put<any>(`${this.apiUrl}/modificar/${id}`, request, { context });
  }

  cancelarSolicitud(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Cancelando solicitud...');
    return this.http.put<void>(`${this.apiUrl}/cancelar/${id}`, {}, { context });
  }

}
