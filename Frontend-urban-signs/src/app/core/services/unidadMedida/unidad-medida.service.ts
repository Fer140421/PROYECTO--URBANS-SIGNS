import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';
export interface UnidadMedida {
  idUnidad?: number;
  nombre: string;
  abreviatura: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  private apiUrl = `${environment.API_URL}/unidad-medida`;

  constructor(private http: HttpClient) { }

  listar(
    page: number,
    size: number,
    nombre: string | null,
    estado: boolean = true
  ): Observable<PagedResponse<UnidadMedida>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('estado', estado.toString());

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return this.http.get<PagedResponse<UnidadMedida>>(`${this.apiUrl}/list-unidades`, {
      params,
      withCredentials: true
    });
  }

  listarAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list`, { withCredentials: true });
  }

  obtenerPorId(id: number): Observable<UnidadMedida> {
    return this.http.get<UnidadMedida>(`${this.apiUrl}/list-unidades/${id}`, { withCredentials: true });
  }

  crear(unidad: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando unidad de medida...');
    return this.http.post<any>(`${this.apiUrl}/register-unidad`, unidad, { withCredentials: true, context });
  }

  actualizar(id: number, unidad: UnidadMedida): Observable<UnidadMedida> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la unidad...');
    return this.http.put<UnidadMedida>(`${this.apiUrl}/mod-unidad/${id}`, unidad, { withCredentials: true, context });
  }

  eliminar(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Cambiando estado de la unidad...');
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { withCredentials: true, context });
  }
}
