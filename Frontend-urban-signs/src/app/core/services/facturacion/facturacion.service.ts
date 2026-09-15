import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  private apiUrl = `${environment.API_URL}/facturacion`;
  private http = inject(HttpClient);

  obtenerFacturaPorPedido(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido/${idPedido}`);
  }

  listarFacturas(pagina: number = 1, tamañoPagina: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamañoPagina', tamañoPagina.toString());

    return this.http.get<any>(`${this.apiUrl}/listar`, { params });
  }
}
