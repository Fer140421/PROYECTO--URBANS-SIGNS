export interface Permission {
  id_permiso: number;
  codigo: string;
  nombre: string;
  modulo: string;
  accion: string;
  estado: boolean;
}

export interface PermissionApiResponse {
  id_permiso?: number;
  idPermiso?: number;
  idPermission?: number;
  id?: number;
  codigo?: string;
  code?: string;
  nombre?: string;
  name?: string;
  modulo?: string;
  module?: string;
  accion?: string;
  action?: string;
  estado?: boolean;
  state?: boolean;
}

export interface RolePermissionsUpdateRequest {
  permissionIds: number[];
}
