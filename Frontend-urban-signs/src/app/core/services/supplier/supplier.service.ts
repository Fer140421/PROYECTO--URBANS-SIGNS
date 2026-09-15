import { HttpClient, HttpContext, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment'
import { UsuarioEmpleadoDTO } from '../../models/employee/usuarioEmpleado.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})export class SupplierService {

  private apiUrl = `${environment.API_URL}/supplier`;

  constructor(private http: HttpClient) { }

  getSuppliers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/listSupplier`, { withCredentials: true });
  }

  registerSupplier(supplier: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando proveedor...');
    return this.http.post<any>(`${this.apiUrl}/register-prov`, supplier, { withCredentials: true, context });
  }

  updateSupplier(id: number, supplier: any): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del proveedor...');
    return this.http.put<any>(`${this.apiUrl}/mod-prov/${id}`, supplier, { withCredentials: true, context });
  }

  deleteSupplierLogically(id: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando proveedor...');
    return this.http.put(`${this.apiUrl}/delete/${id}`, null, { withCredentials: true, context });
  }

  activateSupplier(id: number): Observable<HttpResponse<string>> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Activando proveedor...');
    return this.http.put<string>(`${this.apiUrl}/activate/${id}`, null, { observe: 'response', withCredentials: true, context });
  }

  getSuppliersWithFilters(status?: boolean, searchTerm?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status !== null && status !== undefined) {
      params = params.set('status', status.toString());
    }

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<any>(`${this.apiUrl}/list-filters`, {
      params,
      withCredentials: true
    });
  }
  
}
