import { inject, Injectable } from '@angular/core';
import { UserRolesUpdateDTO } from '../../models/UsuarioRoles/usuarioRoles.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpContext } from '@angular/common/http';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class UsuariosRolesService {
  private http = inject(HttpClient)

  private apiUrl = `${environment.API_URL}/user_roles`;

  updateUserRoles(idUser: number, dto: UserRolesUpdateDTO): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Asignando roles al usuario...');
    return this.http.put<void>(`${this.apiUrl}/add/${idUser}`, dto, { context });
  }
}
