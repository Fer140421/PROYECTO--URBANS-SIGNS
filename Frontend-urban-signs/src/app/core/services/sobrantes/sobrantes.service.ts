import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResiduoMaterial } from '../../models/sobrantes/sobrantes.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class SobrantesService {
  private apiUrl = `${environment.API_URL}/api/residuos`;

  constructor(private http: HttpClient) { }
  registrar(residuo: ResiduoMaterial): Observable<ResiduoMaterial> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando sobrante...');
    return this.http.post<ResiduoMaterial>(this.apiUrl, residuo, { context });
  }

  actualizar(id: number, residuo: ResiduoMaterial): Observable<ResiduoMaterial> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del sobrante...');
    return this.http.put<ResiduoMaterial>(`${this.apiUrl}/${id}`, residuo, { context });
  }

  obtenerPorId(id: number): Observable<ResiduoMaterial> {
    return this.http.get<ResiduoMaterial>(`${this.apiUrl}/${id}`);
  }

  listar(): Observable<ResiduoMaterial[]> {
    return this.http.get<ResiduoMaterial[]>(this.apiUrl);
  }

  eliminar(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando sobrante...');
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { context });
  }

  listarPorMaterial(
    idMaterial: number,
    page: number = 0,
    size: number = 10,
    estado?: string
  ) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<any>(
      `${this.apiUrl}/material/${idMaterial}`,
      { params }
    );
  }
}
