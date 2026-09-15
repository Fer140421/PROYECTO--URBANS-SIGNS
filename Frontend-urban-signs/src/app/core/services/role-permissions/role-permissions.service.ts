import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Permission, PermissionApiResponse, RolePermissionsUpdateRequest } from '../../models/permissions/permission.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({ providedIn: 'root' })
export class RolePermissionsService {
  private readonly permissionsUrl = `${environment.API_URL}/permisos`;
  private readonly rolePermissionsUrl = `${environment.API_URL}/roles-permisos`;

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<PermissionApiResponse[]>(this.permissionsUrl, { withCredentials: true })
      .pipe(map(permissions => permissions.map(permission => this.normalizePermission(permission))));
  }

  getRolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<PermissionApiResponse[]>(`${this.rolePermissionsUrl}/rol/${roleId}`, { withCredentials: true })
      .pipe(map(permissions => permissions.map(permission => this.normalizePermission(permission))));
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<void> {
    const body: RolePermissionsUpdateRequest = { permissionIds };
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando permisos del rol...');
    return this.http.put<void>(`${this.rolePermissionsUrl}/rol/${roleId}`, body, { withCredentials: true, context });
  }

  private normalizePermission(permission: PermissionApiResponse): Permission {
    const id = permission.id_permiso ?? permission.idPermiso ?? permission.idPermission ?? permission.id;
    if (typeof id !== 'number') {
      throw new Error('El permiso recibido no contiene un identificador válido.');
    }

    return {
      id_permiso: id,
      codigo: permission.codigo ?? permission.code ?? '',
      nombre: permission.nombre ?? permission.name ?? '',
      modulo: permission.modulo ?? permission.module ?? '',
      accion: permission.accion ?? permission.action ?? '',
      estado: permission.estado ?? permission.state ?? true
    };
  }
}
