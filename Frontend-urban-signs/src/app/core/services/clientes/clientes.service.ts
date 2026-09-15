import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { ClienteBusquedaDTO } from '../../models/Clientes/busqueda.model';
import { Observable } from 'rxjs';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';
export interface Cliente {
  idCliente?: number;
  persona?: any;
  empresa?: any;
  tipoClientePersonaEmpresa: string;
  tipoCliente: string;
  estado?: boolean;
  fechaRegistro?: string;
  correo?: string;
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
export class ClientesService {

  private apiUrl = `${environment.API_URL}/clientes`;

  constructor(private http: HttpClient) { }

  buscarClientes(query: string): Observable<ClienteBusquedaDTO[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ClienteBusquedaDTO[]>(`${this.apiUrl}/buscar`, { params });
  }

  registrarCliente(cliente: Cliente): Observable<Cliente> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando cliente...');
    return this.http.post<Cliente>(`${this.apiUrl}/registrar`, cliente, { context });
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del cliente...');
    return this.http.put<Cliente>(`${this.apiUrl}/actualizar/${id}`, cliente, { context });
  }

  listarClientesPaginados(
    page: number,
    size: number,
    nombre?: string,
    estado?: boolean,
    tipoPersonaEmpresa?: string,
    categoria?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (nombre && nombre.trim() !== '') {
      params = params.set('nombre', nombre.trim());
    }

    if (estado !== undefined && estado !== null) {
      params = params.set('estado', estado.toString());
    }

    if (tipoPersonaEmpresa && tipoPersonaEmpresa.trim() !== '') {
      params = params.set('tipo', tipoPersonaEmpresa);
    }

    if (categoria && categoria.trim() !== '') {
      params = params.set('categoria', categoria);
    }

    return this.http.get<any>(`${this.apiUrl}/paginado`, { params, withCredentials: true });
  }

  eliminarCliente(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando cliente...');
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { context });
  }

  activarCliente(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Activando cliente...');
    return this.http.put<void>(`${this.apiUrl}/activar/${id}`, {}, { context });
  }

  cambiarTipoCliente(id: number, tipoCliente: string): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando clasificación del cliente...');
    return this.http.put(
      `${this.apiUrl}/cambiar-tipo/${id}`,
      { tipoCliente },
      { withCredentials: true, context }
    );
  }

}
