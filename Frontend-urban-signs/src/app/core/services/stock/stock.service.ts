import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockDisponible } from '../../models/stock/stockDisponible.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = `${environment.API_URL}/stock`;
  constructor(private http: HttpClient) { }

  listarStock(page: number, size: number, nombre?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return this.http.get<any>(`${this.apiUrl}/disponible`, { params });
  }


}
