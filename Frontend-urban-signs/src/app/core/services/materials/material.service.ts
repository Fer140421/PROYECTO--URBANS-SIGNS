import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { MaterialTrabajoRegistroDTO } from '../../models/materialTrabajo/MaterialTrabajoRegistroDTO.model';
import { Material } from '../../models/materialTrabajo/materialListActivos.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = `${environment.API_URL}/herramientas`;
  constructor(private http: HttpClient) { }

  getMateriales(
    page: number,
    size: number,
    activo: string,
    filtroTexto?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('activo', activo);

    if (filtroTexto && filtroTexto.trim() !== '') {
      params = params.set('filtro', filtroTexto);
    }

    return this.http.get<any>(`${this.apiUrl}/listHerramientas`, { params, withCredentials: true });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  create(material: MaterialTrabajoRegistroDTO, file: File): Observable<MaterialTrabajoRegistroDTO> {
    const formData = new FormData();
    formData.append('material', new Blob([JSON.stringify(material)], { type: 'application/json' }));
    formData.append('file', file);
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando herramienta...');
    return this.http.post<MaterialTrabajoRegistroDTO>(`${this.apiUrl}/RegistrarMaterial`, formData, { withCredentials: true, context });
  }

  update(id: number, material: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('material', new Blob([JSON.stringify(material)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la herramienta...');
    return this.http.put<any>(`${this.apiUrl}/modificar-Material/${id}`, formData, { withCredentials: true, context });
  }

  delete(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando herramienta...');
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { withCredentials: true, context });
  }

  listarMaterialesActivos(): Observable<Material[]> {
    return this.http.get<Material[]>(this.apiUrl + "/activos", { withCredentials: true });
  }

  darCambiarEstado(id: number, estado: 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA'| 'DISPONIBLE'): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando estado de la herramienta...');
    return this.http.put<any>(
      `${this.apiUrl}/actualizar-estado/${id}?estado=${estado}`, {}, { withCredentials: true, context }
    );
  }

}
