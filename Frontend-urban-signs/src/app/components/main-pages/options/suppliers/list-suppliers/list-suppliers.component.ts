import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Supplier } from '../../../../../core/models/supplier/supplier.model';
import { SupplierService } from '../../../../../core/services/supplier/supplier.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-suppliers',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-suppliers.component.html',
  styleUrl: './list-suppliers.component.css'
})
export class ListSuppliersComponent {
  viewMode: 'list' | 'cards' = 'list';

  notificationService = inject(NotificationService)
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  searchTerm: string = '';
  isEditModalOpen = false;
  selectedSupplier?: any;
  Math = Math;
  currentPage = 0;
  totalItems = 0;
  page = 0;
  pageSize = 5;
  totalPages = 0;
  status: string = 'true';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  isLoading = true;
  isProcessing = false;

  constructor(private supplierService: SupplierService) { }

  ngOnInit(): void {
    this.loadSuppliers(this.currentPage);
  }

  loadSuppliers(page: number) {
    if (page < 0 || (this.totalPages && page >= this.totalPages)) return;
    this.isLoading = true;
    const search = this.searchTerm.trim();
    const searchParam = search.length > 0 ? search : undefined;
    let statusParam: boolean | undefined;
    if (this.status === 'true') {
      statusParam = true;
    } else if (this.status === 'false') {
      statusParam = false;
    } else {
      statusParam = undefined;
    }
    this.supplierService.getSuppliersWithFilters(statusParam, searchParam, page, this.pageSize).subscribe((response) => {
      this.suppliers = response.content;
      console.log(this.suppliers)
      this.filteredSuppliers = this.suppliers;
      this.totalPages = response.totalPages;
      this.totalItems = response.totalElements;
      this.currentPage = page;
      this.isLoading = false;
    }, (error) => {
      console.error('Error al cargar proveedores:', error);
      this.isLoading = false;
    });
  }

  normalizeText(text: string): string {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  onStatusChange() {
    this.loadSuppliers(this.currentPage);
  }

  onSearchChange() {
    if (this.searchTerm.trim() === '') {
      this.loadSuppliers(this.currentPage);
    }
  }

  openEditModal(supplier: Supplier) {
    if (this.isProcessing) return;

    this.selectedSupplier = { ...supplier }; // Copiamos para no afectar la lista
    this.isEditModalOpen = true;
  }


  closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedSupplier = null;
  }

  updateSupplier() {
    if (this.isProcessing) return;
    if (!this.selectedSupplier) return;
    console.log(this.selectedSupplier)

    const updatedSupplier = {
      city: this.selectedSupplier.city,
      status: this.selectedSupplier.status,
      people: {
        name_people: this.selectedSupplier.name,
        ap: this.selectedSupplier.ap,
        am: this.selectedSupplier.am,
        ci: this.selectedSupplier.ci,
        phone_number: this.selectedSupplier.phone,
        addres: this.selectedSupplier.address
      }
    };

    const id = this.selectedSupplier.idSupplier;

    this.isProcessing = true;
    this.supplierService.updateSupplier(id, updatedSupplier).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.isEditModalOpen = false;
        this.selectedSupplier = null;
        this.loadSuppliers(this.currentPage);
        this.notificationService.show('Se ha modificado el proveedor', 'success');
      },
      error: () => this.notificationService.show('Error al modificar el proveedor', 'error')
    });
  }

  isDeleteModalOpen = false;
  supplierToDelete: any = null;

  openDeleteModal(supplier: any): void {
    if (this.isProcessing) return;

    const newStatus = !supplier.status;
    const actionText = newStatus ? 'ACTIVAR PROVEEDOR' : 'ELIMINAR PROVEEDOR';
    const message = `¿Estás seguro de ${newStatus ? 'activar' : 'desactivar'} al proveedor?`;
    console.log(supplier)
    this.supplierToDelete = supplier;
    this.isDeleteModalOpen = true;
    this.openConfirmModal(actionText, message, () => {
      if (this.isProcessing) return;

      const action$ = newStatus
        ? this.supplierService.activateSupplier(supplier.idSupplier)
        : this.supplierService.deleteSupplierLogically(supplier.idSupplier);
      this.isProcessing = true;
      action$.pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: (response: any) => {
          this.notificationService.show(
            newStatus ? response.body.message : 'Proveedor eliminado correctamente',
            'info'
          );
          this.loadSuppliers(0);
          this.closeConfirmModal();
        },
        error: () => {
          this.notificationService.show(`Error al ${newStatus ? 'activar' : 'eliminar'} proveedor`, 'error');
        }
      });
    });
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.isDeleteModalOpen = true;
  }

  closeConfirmModal() {
    this.supplierToDelete = null;
    this.isDeleteModalOpen = false;
    this.confirmMessage = '';
    this.confirmTitle = '';
    this.confirmAction = null;
  }

  confirm(): void {
    if (this.isProcessing) return;

    if (this.confirmAction) {
      this.confirmAction();
    }
  }

}
