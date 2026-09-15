import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../../models/roles/roles.model';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private apiUrl = `${environment.API_URL}/role`;


  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl + "/listRole", { withCredentials: true });
  }
}
