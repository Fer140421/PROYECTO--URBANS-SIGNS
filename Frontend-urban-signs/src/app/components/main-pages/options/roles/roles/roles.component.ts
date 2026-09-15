import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../../../core/services/role/role.service';
import { Role } from '../../../../../core/models/roles/roles.model';
import { Employee } from '../../../../../core/models/employee/employee.model';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { UsuariosRolesService } from '../../../../../core/services/usuarios-roles/usuarios-roles.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ViewToggleComponent, ResponsiveDataViewComponent,
    DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  employeeService = inject(EmployeeService);
  roleService = inject(RoleService);
  usuarioRoles = inject(UsuariosRolesService);
  notificacion = inject(NotificationService);

  listRoles: any[] = [];
  listEmployee: Employee[] = [];
  filteredEmployees: any[] = [];

  searchTerm: string = '';
  selectedRoleFilter: string = '';
  selectedEmployee: any | null = null;
  tempRoles: string[] = [];

  Math = Math;
  currentPage = 0;
  pageSize = 10; 
  totalPages = 0;
  totalItems = 0;
  filterStatus: boolean = true;
  isLoading = true;
  isSaving = false;

  ngOnInit(): void {
    this.loadRoles();
    this.loadEmployees(this.currentPage);
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.listRoles = data;
      },
      error: (err) => {
        console.error('Error cargando roles:', err);
        this.notificacion.error('Error al cargar roles');
      }
    });
  }

  loadEmployees(page: number) {
    this.isLoading = true;
    this.employeeService.listEmployees(
      this.filterStatus,
      page,
      this.pageSize,
      this.searchTerm || undefined
    ).subscribe({
      next: response => {
        this.listEmployee = response.content;
        this.filteredEmployees = this.listEmployee;

        if (this.selectedRoleFilter) {
          this.filteredEmployees = this.filteredEmployees.filter(emp =>
            emp.roles && emp.roles.includes(this.selectedRoleFilter)
          );
        }

        console.log('Empleados cargados:', this.listEmployee);
        this.totalPages = response.totalPages;
        this.totalItems = response.totalElements;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al listar empleados:', err);
        this.notificacion.error('Error al cargar empleados');
        this.isLoading = false;
      }
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadEmployees(0);
    }
  }

  searchEmployees() {
    this.loadEmployees(0);
  }

  onRoleFilterChange() {
    this.loadEmployees(0);
  }

  openRoleModal(emp: any) {
    if (this.isSaving) return;

    this.selectedEmployee = emp;
    this.tempRoles = [...emp.roles];
  }

  toggleRole(role: Role) {
    const roleName = role.name_role;
    if (this.tempRoles.includes(roleName)) {
      this.tempRoles = this.tempRoles.filter(r => r !== roleName);
    } else {
      this.tempRoles.push(roleName);
    }
  }

  saveRoles() {
    if (this.isSaving) return;

    if (this.selectedEmployee) {
      const selectedRoleIds = this.listRoles
        .filter(role => this.tempRoles.includes(role.name_role))
        .map(role => role.idRole);

      const updateDto = {
        idUser: this.selectedEmployee.idUser,
        roles: selectedRoleIds
      };

      console.log('Actualizando roles:', updateDto);

      this.isSaving = true;
      this.usuarioRoles.updateUserRoles(updateDto.idUser, updateDto).pipe(
        finalize(() => this.isSaving = false)
      ).subscribe({
        next: () => {
          console.log(`Roles actualizados para ${this.selectedEmployee.name}`);
          this.notificacion.success("Roles registrados exitosamente");
          this.loadEmployees(this.currentPage);
          this.closeModal();
        },
        error: err => {
          this.notificacion.error("Ocurrió un error al registrar");
          console.error('Error al actualizar roles:', err);
        }
      });
    }
  }

  closeModal() {
    this.selectedEmployee = null;
    this.tempRoles = [];
  }

}
