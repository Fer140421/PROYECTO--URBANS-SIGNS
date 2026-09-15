import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Permission } from '../../../../../core/models/permissions/permission.model';
import { Role } from '../../../../../core/models/roles/roles.model';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { RolePermissionsService } from '../../../../../core/services/role-permissions/role-permissions.service';
import { RoleService } from '../../../../../core/services/role/role.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.css'
})
export class RolePermissionsComponent implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly rolePermissionsService = inject(RolePermissionsService);
  private readonly notificationService = inject(NotificationService);

  roles: Role[] = [];
  permissionsByModule: { module: string; permissions: Permission[] }[] = [];
  selectedRoleId: number | null = null;
  selectedPermissionIds = new Set<number>();
  savedPermissionIds = new Set<number>();
  roleSearchTerm = '';
  permissionSearchTerm = '';
  isInitialLoading = true;
  isRoleLoading = false;
  isSaving = false;
  errorMessage = '';
  showConfirmation = false;

  ngOnInit(): void { this.loadInitialData(); }

  loadInitialData(): void {
    this.isInitialLoading = true;
    this.errorMessage = '';
    forkJoin({ roles: this.roleService.getAllRoles(), permissions: this.rolePermissionsService.getPermissions() })
      .pipe(finalize(() => this.isInitialLoading = false))
      .subscribe({
        next: ({ roles, permissions }) => {
          this.roles = roles;
          this.permissionsByModule = this.groupPermissionsByModule(permissions);
        },
        error: error => {
          console.error('Error al cargar roles o permisos:', error);
          this.errorMessage = 'No se pudieron cargar los roles y permisos. Intente nuevamente.';
        }
      });
  }

  onRoleChange(): void {
    this.showConfirmation = false;
    this.selectedPermissionIds.clear();
    this.errorMessage = '';
    if (this.selectedRoleId === null) return;
    this.isRoleLoading = true;
    this.rolePermissionsService.getRolePermissions(this.selectedRoleId)
      .pipe(finalize(() => this.isRoleLoading = false))
      .subscribe({
        next: permissions => {
          const permissionIds = permissions.map(permission => permission.id_permiso);
          this.selectedPermissionIds = new Set(permissionIds);
          this.savedPermissionIds = new Set(permissionIds);
        },
        error: error => {
          console.error('Error al obtener permisos del rol:', error);
          this.errorMessage = 'No se pudieron consultar los permisos asignados a este rol.';
        }
      });
  }

  selectRole(roleId: number): void {
    if (this.selectedRoleId === roleId) return;
    this.selectedRoleId = roleId;
    this.onRoleChange();
  }

  get filteredRoles(): Role[] {
    const search = this.roleSearchTerm.trim().toLowerCase();
    return !search ? this.roles : this.roles.filter(role => role.name_role.toLowerCase().includes(search));
  }

  get filteredPermissionGroups(): { module: string; permissions: Permission[] }[] {
    const search = this.permissionSearchTerm.trim().toLowerCase();
    if (!search) return this.permissionsByModule;

    return this.permissionsByModule
      .map(group => ({
        module: group.module,
        permissions: group.permissions.filter(permission =>
          [permission.nombre, permission.codigo, permission.accion, permission.modulo]
            .some(value => value.toLowerCase().includes(search))
        )
      }))
      .filter(group => group.permissions.length > 0);
  }

  isPermissionSelected(permissionId: number): boolean { return this.selectedPermissionIds.has(permissionId); }

  togglePermission(permissionId: number, checked: boolean): void {
    checked ? this.selectedPermissionIds.add(permissionId) : this.selectedPermissionIds.delete(permissionId);
  }

  requestSave(): void {
    if (this.selectedRoleId !== null && !this.isRoleLoading && !this.isSaving) this.showConfirmation = true;
  }

  cancelSave(): void { this.showConfirmation = false; }

  cancelChanges(): void {
    this.showConfirmation = false;
    this.selectedPermissionIds = new Set(this.savedPermissionIds);
  }

  savePermissions(): void {
    if (this.selectedRoleId === null || this.isSaving) return;
    this.isSaving = true;
    this.errorMessage = '';
    this.rolePermissionsService.updateRolePermissions(this.selectedRoleId, Array.from(this.selectedPermissionIds))
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.showConfirmation = false;
          this.savedPermissionIds = new Set(this.selectedPermissionIds);
          this.notificationService.success('Permisos del rol actualizados correctamente.');
        },
        error: error => {
          console.error('Error al actualizar permisos del rol:', error);
          this.showConfirmation = false;
          this.errorMessage = 'No se pudieron guardar los permisos. La configuración anterior se mantiene.';
          this.notificationService.error('No se pudieron guardar los permisos del rol.');
        }
      });
  }

  get selectedRoleName(): string {
    return this.roles.find(role => role.idRole === this.selectedRoleId)?.name_role ?? '';
  }

  private groupPermissionsByModule(permissions: Permission[]): { module: string; permissions: Permission[] }[] {
    const grouped = permissions.reduce((result, permission) => {
      const module = permission.modulo || 'SIN MÓDULO';
      (result[module] ??= []).push(permission);
      return result;
    }, {} as Record<string, Permission[]>);
    return Object.keys(grouped).sort().map(module => ({
      module,
      permissions: grouped[module].sort((a, b) => a.nombre.localeCompare(b.nombre))
    }));
  }
}
