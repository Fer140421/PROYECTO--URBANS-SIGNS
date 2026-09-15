import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarCotizacionService {
  private apiUrl = `${environment.API_URL}/material-produccion`;


  constructor(private http: HttpClient) { }

  confirmarYEnviarProduccion(datos: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Confirmando cotización y enviando a producción...');
    return this.http.post(`${this.apiUrl}/confirmar`, datos, { context });
  }

  guardarBorrador(datos: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando borrador de cotización...');
    return this.http.post(`${this.apiUrl}/borrador`, datos, { context });
  }

  obtenerOrdenProduccion(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orden/${id}`);
  }
}
