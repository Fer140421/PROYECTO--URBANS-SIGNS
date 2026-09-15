import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../../../core/models/employee/employee.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-staff',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    ViewToggleComponent,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ActionIconButtonComponent
  ],
  templateUrl: './list-staff.component.html',
  styleUrl: './list-staff.component.css'
})
export class ListStaffComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'cards';
  employeeService = inject(EmployeeService);
  notificationService = inject(NotificationService)
  listEmployee: Employee[] = [];
  isEditModalOpen = false;
  selectedEmployee?: any;
  filteredEmployees: any[] = [];
  searchTerm: string = '';
  // Variables para manejo de foto
  selectedFile: File | null = null;
  photoPreview: string | null = null;

  Math = Math;
  currentPage = 0;
  pageSize = 8;
  totalPages = 0;
  totalItems = 0;
  filterStatus: boolean = true;
  filterStatusString: string = 'true';
  isDetailModalOpen = false;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    this.loadEmployees(this.currentPage);
  }

  loadEmployees(page: number) {
    this.isLoading = true;
    this.employeeService.listEmployees(this.filterStatus, page, this.pageSize, this.searchTerm || undefined).subscribe({
      next: response => {
        this.listEmployee = response.content;
        this.filteredEmployees = this.listEmployee;
        console.log(this.listEmployee);
        this.totalPages = response.totalPages;
        this.totalItems = response.totalElements;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error al listar empleados:', err);
        this.isLoading = false;
      }
    });
  }

  onStatusChange() {
    this.loadEmployees(0);
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadEmployees(0);
    }
  }

  searchEmployees(): void {
    this.loadEmployees(0);
  }

  toggleCategoryStatus(employee: any): void {
    if (this.isProcessing) return;

    const newStatus = !employee.status;
    const actionText = newStatus ? 'ACTIVAR EMPLEADO' : 'ELIMINAR EMPLEADO';
    const message = `¿Estás seguro de ${newStatus ? 'activar' : 'desactivar'} al empleado?`;

    this.openConfirmModal(actionText, message, () => {
      if (this.isProcessing) return;

      const action$ = newStatus
        ? this.employeeService.activateEmployee(employee.idEmployee)
        : this.employeeService.deleteEmployee(employee.idEmployee);

      this.isProcessing = true;
      action$.pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: (response: any) => {
          this.notificationService.show(
            newStatus ? response.body.message : 'Se ha eliminado el empleado, las credeciales de acceso fueron bloqueadas',
            'info'
          );
          this.loadEmployees(0);
          this.closeConfirmModal();
        },
        error: () => {
          this.notificationService.show(`Error al ${newStatus ? 'activar' : 'eliminar'} empleado`, 'error');
        }
      });
    });
  }

  confirm(): void {
    if (this.isProcessing) return;

    if (this.confirmAction) {
      this.confirmAction();
    }
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.confirmMessage = '';
    this.confirmTitle = '';
    this.confirmAction = null;
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  openEditModal(employee: any) {
    if (this.isProcessing) return;

    // Cada edición debe comenzar sin archivos seleccionados de otro empleado.
    this.resetPhotoSelection();
    this.selectedEmployee = JSON.parse(JSON.stringify(employee));
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedEmployee = null;
    this.resetPhotoSelection();
  }

  private resetPhotoSelection(): void {
    this.selectedFile = null;
    this.photoPreview = null;
  }

  normalizeText(text: string): string {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadEmployees(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.loadEmployees(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.loadEmployees(page);
    }
  }

  // Variables para el modal

  // Abrir modal de detalles
  openDetailModal(employee: any) {
    this.selectedEmployee = employee;
    this.isDetailModalOpen = true;
  }

  // Cerrar modal de detalles
  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedEmployee = null;
  }

  // Editar empleado (implementa según tu lógica)
  editEmployee(employee: any) {
    this.closeDetailModal();
    // Tu lógica para editar
    console.log('Editar empleado:', employee);
  }

  // Manejo de selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Remover foto seleccionada
  removePhoto() {
    this.selectedFile = null;
    this.photoPreview = null;
  }

   getInitials(name: string, apellido: string): string {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  updateEmployee() {
    if (this.isProcessing) return;

    const employeeData = {
      ci: this.selectedEmployee.ci,
      namePeople: this.selectedEmployee.name,
      ap: this.selectedEmployee.ap,
      am: this.selectedEmployee.am,
      phoneNumber: this.selectedEmployee.phone,
      address: this.selectedEmployee.address,
    };

    this.isProcessing = true;
    this.employeeService.updateEmployee(
      this.selectedEmployee.idEmployee, 
      employeeData, 
      this.selectedFile || undefined
    ).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (res) => {
        this.loadEmployees(this.currentPage);
        this.closeEditModal();
        this.notificationService.show('Empleado modificado exitosamente', 'success');
      },
      error: (err) => {
        this.notificationService.show('Error al modificar el empleado', 'error');
        console.error(err);
      }
    });
  }

}
