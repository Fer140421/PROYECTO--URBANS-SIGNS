import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../../models/employee/employee.model';
import { environment } from '../../../../environments/environment'
import { Empleado } from '../../models/employee/ListEmpleadosActivos.model';
import { UsuarioEmpleadoDTO } from '../../models/employee/usuarioEmpleado.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = `${environment.API_URL}/employee`;

  constructor(private http: HttpClient) { }

  listEmployees(status?: boolean, page: number = 0, size: number = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (status !== undefined) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.apiUrl}/listEmployee`, { params, withCredentials: true });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employee/select/${id}`, { withCredentials: true });
  }

  createEmployee(employee: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append(
      'employee',
      new Blob([JSON.stringify(employee)], { type: 'application/json' })
    );
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<any>(`${this.apiUrl}/register`, formData, {
      withCredentials: true,
      context: new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando empleado...')
    });
  }

  updateEmployee(id: number, employeeData: any, file?: File) {
    const formData = new FormData();

    formData.append('employee', new Blob([JSON.stringify(employeeData)], {
      type: 'application/json'
    }));

    if (file) {
      formData.append('file', file);
    }

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del empleado...');
    return this.http.put(`${this.apiUrl}/mod/${id}`, formData, { context });
  }

  deleteEmployee(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando empleado...');
    return this.http.delete<void>(`${this.apiUrl}/del/${id}`, { withCredentials: true, context });
  }

  activateEmployee(id: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Activando empleado...');
    return this.http.put(`${this.apiUrl}/activate/${id}`, {}, { observe: 'response', withCredentials: true, context });
  }

  obtenerEmpleadosActivos(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/activos`, { withCredentials: true });
  }

  getEmployeeList(
    page: number = 0,
    size: number = 10,
    searchTerm: string = '',
    estadoUsuario: boolean | null = null
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (estadoUsuario !== null) {
      params = params.set('estadoUsuario', estadoUsuario.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/listUserEmployee`, {
      withCredentials: true,
      params: params
    });
  }

  getCurrentProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, {
      withCredentials: true
    });
  }
}
