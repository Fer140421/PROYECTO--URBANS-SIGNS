import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';
export interface Trabajo {
  idTrabajo: number;
  foto: string;
  nombre: string;
  descripcion: string;
  estado: string;
}

export interface TrabajoSimple {
  id: number;
  nombre: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
@Injectable({
  providedIn: 'root'
})
export class TrabajosService {

  private apiUrl = `${environment.API_URL}/trabajos`;

  constructor(private http: HttpClient) { }

  crear(dto: any, file: File): Observable<Trabajo> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    formData.append('file', file);

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando servicio...');
    return this.http.post<Trabajo>(`${this.apiUrl}/registrar`, formData, { context });
  }

  editar(id: number, dto: any, file?: File): Observable<Trabajo> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del servicio...');
    return this.http.put<Trabajo>(`${this.apiUrl}/modificar/${id}`, formData, { context });
  }

  listar(
    page: number = 0,
    size: number = 10,
    nombre?: string,
    estado?: boolean
  ): Observable<Page<Trabajo>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (estado !== undefined) {
      params = params.set('estado', estado.toString());
    }

    return this.http.get<Page<Trabajo>>(`${this.apiUrl}/listar`, { params });
  }


  listarSimple(): Observable<TrabajoSimple[]> {
    return this.http.get<TrabajoSimple[]>(`${this.apiUrl}/simple`);
  }

  eliminarLogico(id: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando servicio...');
    return this.http.patch<any>(`${this.apiUrl}/eliminar/${id}`, {}, { context });
  }

  activar(id: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Activando servicio...');
    return this.http.patch<any>(`${this.apiUrl}/activar/${id}`, {}, { context });
  }
}
