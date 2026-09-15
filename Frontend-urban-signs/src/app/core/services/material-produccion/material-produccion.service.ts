import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UnidadMedida } from '../unidadMedida/unidad-medida.service';
import { environment } from '../../../../environments/environment';
import { MaterialStatsDTO } from '../../models/MaterialProduccion/materialDatos.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

export interface MaterialProduccion {
  idMaterial?: number;
  idCategoria: number;
  unidad: UnidadMedida;
  nombre: string;
  caracteristica?: string;
  color?: string;
  fechaCreacion?: string;
  base?: number;
  altura?: number;
  foto?: string;
  estado?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class MaterialProduccionService {
  private apiUrl = `${environment.API_URL}/material-produccion`;

  constructor(private http: HttpClient) { }

  listar(nombre?: string, estado: boolean = true, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('estado', estado)
      .set('page', page)
      .set('size', size);

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return this.http.get<any>(`${this.apiUrl}/list`, { params });
  }

  crear(material: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append(
      'material',
      new Blob([JSON.stringify(material)], { type: 'application/json' })
    );
    formData.append('file', file);
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando material de producción...');
    return this.http.post<any>(`${this.apiUrl}/create`, formData, { context });
  }

  actualizar(id: number, material: any, file?: File): Observable<MaterialProduccion> {
    const formData = new FormData();
    formData.append("material", new Blob([JSON.stringify(material)], { type: 'application/json' }));

    if (file) {
      formData.append("file", file);
    }

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del material...');
    return this.http.put<MaterialProduccion>(`${this.apiUrl}/update/${id}`, formData, { context });
  }

  eliminar(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando material de producción...');
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { context });
  }

  getSimpleMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listAll`, { withCredentials: true });
  }

  getMaterialStats(): Observable<MaterialStatsDTO> {
    const params = new HttpParams();
    return this.http.get<MaterialStatsDTO>(`${this.apiUrl}/stats`, { params, withCredentials: true });
  }

}
