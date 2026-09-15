import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

export interface DetalleCompraDTO {
  idMaterial: number;
  cantidad: number;
  precioUnitario: number;
  precioVenta?: number;
}

export interface CompraRequestDTO {
  idProveedor: number;
  detalles: DetalleCompraDTO[];
}

export interface CompraResponse {
  idCompra: number;
  proveedor: any;
  fecha: string;
  estado: string;
  total: number;
  detalles: DetalleCompraDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private apiUrl = `${environment.API_URL}/compras`;

  constructor(private http: HttpClient) { }

  listarCompras(
    estado?: string,
    idCompra?: number,
    idProveedor?: number,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (estado) params = params.set('estado', estado);
    if (idCompra) params = params.set('idCompra', idCompra.toString());
    if (idProveedor) params = params.set('idProveedor', idProveedor.toString());

    return this.http.get<any>(`${this.apiUrl}/listar`, { params, withCredentials: true });
  }
  // Crear compra
  crearCompra(compra: any): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando compra...');
    return this.http.post<void>(`${this.apiUrl}/crear`, compra, { withCredentials: true, context });
  }

  confirmarCompra(idCompra: number, confirmarDTO: any): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Confirmando compra y actualizando inventario...');
    return this.http.put<void>(`${this.apiUrl}/confirmar/${idCompra}`, confirmarDTO, {
      withCredentials: true,
      context
    });
  }


  eliminarDetalle(idDetalle: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando detalle de compra...');
    return this.http.delete<void>(`${this.apiUrl}/detalle/${idDetalle}`, { context });
  }

  cancelarCompra(id: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Cancelando compra...');
    return this.http.put<any>(`${this.apiUrl}/cancelar/${id}`, {}, { context });
  }

  modificarCompra(idCompra: number, compra: any): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la compra...');
    return this.http.put<void>(`${this.apiUrl}/modificar/${idCompra}`, compra, { context });
  }

} 
