import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Category } from '../../../../../core/models/category/category.model';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { UnidadMedidaService } from '../../../../../core/services/unidadMedida/unidad-medida.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './unidades.component.html',
  styleUrl: './unidades.component.css'
})
export class UnidadesComponent {
  viewMode: 'list' | 'cards' = 'list';
  notificationService = inject(NotificationService);
  unidadMedida = inject(UnidadMedidaService);
  fb = inject(FormBuilder);

  nombreYaExiste: boolean = false;
  Math = Math;
  unidades: any[] = [];
  isLoading = true;
  filteredCategories: Category[] = [];

  isModalOpen = false;
  isEditing = false;
  isProcessing = false;
  searchTerm: string = '';
  statusFilter: boolean = true;
  itemsPerPage = 5;
  unidadForm!: FormGroup;
  selectedId: number | null = null;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadUnidades();
    this.initForm();
    this.unidadForm.controls['nombre'].valueChanges.subscribe(() => {
      this.nombreYaExiste = false;
    });
  }

  initForm(): void {
    this.unidadForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/)
      ]],
      abreviatura: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/)
      ]]
    });
  }

  loadUnidades(): void {
    this.isLoading = true;
    this.unidadMedida.listar(
      this.currentPage - 1,
      this.pageSize,
      this.searchTerm?.trim() || null,
      this.statusFilter
    ).subscribe(data => {
      this.unidades = data.content;
      this.totalItems = data.totalElements;
      this.totalPages = data.totalPages;
      this.isLoading = false;
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadUnidades();
    }
  }

  createCategory(): void {
    if (this.isProcessing) return;

    if (this.unidadForm.invalid) {
      this.notificationService.show('Por favor, completa los campos requeridos', 'error');
      return;
    }

    const newCategory = this.unidadForm.value;

    this.isProcessing = true;
    this.unidadMedida.crear(newCategory).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadUnidades();
        this.closeModal();
        this.nombreYaExiste = false;
        this.notificationService.show('Categoría creada con éxito', 'success');
      },
      error: (err) => {
        this.nombreYaExiste = true;
        console.error('Error inesperado:', err);
        this.notificationService.show('Error al crear la categoría', 'error');
      }
    });
  }

  updateUnidad(): void {
    if (this.isProcessing) return;
    if (!this.selectedId) return;
    if (this.unidadForm.invalid) {
      this.notificationService.show('Por favor, completa los campos requeridos', 'error');
      return;
    }

    const updatedUnidad = this.unidadForm.value;

    this.isProcessing = true;
    this.unidadMedida.actualizar(this.selectedId, updatedUnidad).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadUnidades();
        this.closeModal();
        this.notificationService.show('Unidad de medida actualizada con éxito', 'success');
      },
      error: () => {
        this.notificationService.show('Error al actualizar la unidad de medida', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.isProcessing) return;

    if (this.isEditing) {
      this.updateUnidad();
    } else {
      this.createCategory();
    }
  }

  toggleCategoryStatus(category: any): void {
    if (this.isProcessing) return;

    const updatedCategory: any = {
      ...category,
      estado: !category.estado
    };
    const actionText = updatedCategory.estado ? 'ACTIVAR UNIDAD DE MEDIDA' : 'DESACTIVAR UNIDAD DE MEDIDA';
    const message = `¿Estás seguro de ${updatedCategory.estado ? 'activar' : 'desactivar'} la unidad de medida "${category.nombre}"?`;
    this.openConfirmModal(actionText, message, () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.unidadMedida.eliminar(category.idUnidad!).pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: () => {
          this.loadUnidades();
          this.closeConfirmModal();
          this.notificationService.show(`Unidad de medida ${updatedCategory.estado ? 'activada' : 'desactivada'} correctamente`, 'info');
        },
        error: () => {
          this.notificationService.show('Error al cambiar estado de la unidad de medida', 'error');
        }
      });
    });
  }

  openCreateModal(): void {
    if (this.isProcessing) return;

    this.selectedId = null;
    this.isEditing = false;
    this.unidadForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(unidad: any): void {
    if (this.isProcessing) return;

    this.selectedId = unidad.idUnidad ?? null;
    this.isEditing = true;
    this.unidadForm.patchValue({
      nombre: unidad.nombre,
      abreviatura: unidad.abreviatura
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
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

  filterByStatus(): void {
    switch (this.statusFilter) {
      case true:
        // lógica para activos
        break;
      case false:
        // lógica para inactivos
        break;
      default:
        this.statusFilter = true;
    }
    this.currentPage = 1;
    this.loadUnidades();
  }

  // Paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUnidades();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUnidades();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadUnidades();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  searchCategories(): void {
    this.currentPage = 1;

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadUnidades();
    } else {
      this.loadUnidades();
    }
  }

}
