import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../../../core/services/category/category.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Category } from '../../../../core/models/category/category.model';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-categorys',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './categorys.component.html',
  styleUrl: './categorys.component.css'
})
export class CategorysComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  notificationService = inject(NotificationService)
  fb = inject(FormBuilder);

  nombreYaExiste: boolean = false;
  Math = Math;
  categories: any[] = [];
  isLoading = true;
  filteredCategories: any[] = [];
  selectedCategory: any = {
    idCategoria: 0,
    nombre: '',
    descripcion: '',
    estado: true
  };

  isModalOpen = false;
  isEditing = false;
  isProcessing = false;
  searchTerm = '';
  statusFilter: 'true' | 'false' | 'todos' = 'true';
  itemsPerPage = 5;
  categoryForm!: FormGroup;
  selectedCategoryId: number | null = null;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  filterStatus: boolean = true;
  materialesEnCategoria: any[] = [];
  isMaterialsModalOpen = false;
  categoriaAEliminar: Category | null = null;
  categoriasParaReasignar: Category[] = [];
  selectedNewCategoryId: number | null = null;

  constructor(private categoryService: CategoryService) { }

  static validadorTextoSoloLetras(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    // Permite letras (con tildes), espacios y ñ
    const textoPattern = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;

    if (!textoPattern.test(control.value)) {
      return { textoInvalido: true };
    }

    return null;
  }

  // Validador para evitar solo espacios
  static validadorNoSoloEspacios(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    if (control.value.trim().length === 0) {
      return { soloEspacios: true };
    }

    return null;
  }

  // Validador para evitar espacios múltiples consecutivos
  static validadorEspaciosMultiples(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    if (/\s{2,}/.test(control.value)) {
      return { espaciosMultiples: true };
    }

    return null;
  }

  // Validador combinado para texto limpio
  static validadorTextoLimpio(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const value = control.value.toString();

    // No debe empezar ni terminar con espacios
    if (value !== value.trim()) {
      return { espaciosExtremos: true };
    }

    // No debe tener caracteres especiales excepto tildes y ñ
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
      return { caracteresInvalidos: true };
    }

    // No debe tener espacios múltiples
    if (/\s{2,}/.test(value)) {
      return { espaciosMultiples: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();

    this.categoryForm.controls['nombre'].valueChanges.subscribe(() => {
      this.nombreYaExiste = false;
    });

    this.categoryForm.controls['nombre'].valueChanges.subscribe((value) => {
      if (value && value.length > 0) {
        const capitalizado = value.charAt(0).toUpperCase() + value.slice(1);
        if (value !== capitalizado) {
          this.categoryForm.controls['nombre'].setValue(capitalizado, { emitEvent: false });
        }
      }
    });

    this.categoryForm.controls['descripcion'].valueChanges.subscribe((value) => {
      if (value && value.length > 0) {
        const capitalizado = value.charAt(0).toUpperCase() + value.slice(1);
        if (value !== capitalizado) {
          this.categoryForm.controls['descripcion'].setValue(capitalizado, { emitEvent: false });
        }
      }
    });
  }
  initForm(): void {
    this.categoryForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        CategorysComponent.validadorTextoLimpio,
        CategorysComponent.validadorNoSoloEspacios
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
        CategorysComponent.validadorTextoLimpio,
        CategorysComponent.validadorNoSoloEspacios
      ]]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    let estadoParam: 'true' | 'false' | 'todos' = this.statusFilter;
    this.categoryService.listarCategorias(
      this.searchTerm || undefined,
      estadoParam,
      this.currentPage - 1,
      this.pageSize
    ).subscribe(data => {
      this.categories = data.content;
      this.totalItems = data.totalElements;
      this.totalPages = data.totalPages;
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadCategories();
    }
  }

  private normalizarTexto(texto: string): string {
    const textoLimpio = texto
      .trim()
      .replace(/\s+/g, ' ');
    return this.capitalizarPrimeraLetra(textoLimpio);
  }

  private capitalizarPrimeraLetra(texto: string): string {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  createCategory(): void {
    if (this.isProcessing) return;

    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.markAsTouched();
    });

    if (this.categoryForm.invalid) {
      this.notificationService.show('Por favor, completa correctamente todos los campos', 'error');
      return;
    }

    const newCategory = {
      nombre: this.normalizarTexto(this.categoryForm.value.nombre),
      descripcion: this.normalizarTexto(this.categoryForm.value.descripcion)
    };

    this.isProcessing = true;
    this.categoryService.registrarCategoria(newCategory).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
        this.nombreYaExiste = false;
        this.notificationService.show('Categoría creada con éxito', 'success');
      },
      error: (err) => {
        if (err.status === 409 || err.error?.message?.includes('existe')) {
          this.nombreYaExiste = true;
          this.notificationService.error('Ya existe una categoría con ese nombre');
        } else {
          console.error('Error inesperado:', err);
          this.notificationService.error('Error al crear la categoría');
        }
      }
    });
  }

  updateCategory(): void {
    if (this.isProcessing) return;
    if (!this.selectedCategoryId) return;
    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.markAsTouched();
    });

    if (this.categoryForm.invalid) {
      this.notificationService.show('Por favor, completa correctamente todos los campos', 'error');
      return;
    }
    const updatedCategory = {
      nombre: this.normalizarTexto(this.categoryForm.value.nombre),
      descripcion: this.normalizarTexto(this.categoryForm.value.descripcion)
    };

    this.isProcessing = true;
    this.categoryService.modificarCategoria(this.selectedCategoryId, updatedCategory).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
        this.notificationService.show('Categoría actualizada con éxito', 'success');
      },
      error: (err) => {
        if (err.status === 409 || err.error?.message?.includes('existe')) {
          this.nombreYaExiste = true;
          this.notificationService.error('Ya existe una categoría con ese nombre');
        } else {
          this.notificationService.error('Error al actualizar la categoría');
        }
      }
    });
  }

  onSubmit(): void {
    if (this.isProcessing) return;

    if (this.isEditing) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  openCreateModal(): void {
    if (this.isProcessing) return;

    this.selectedCategoryId = null;
    this.isEditing = false;
    this.nombreYaExiste = false;
    this.categoryForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(category: Category): void {
    if (this.isProcessing) return;

    this.selectedCategoryId = category.idCategoria ?? null;
    this.isEditing = true;
    this.nombreYaExiste = false;
    this.categoryForm.patchValue({
      nombre: category.nombre,
      descripcion: category.descripcion
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.nombreYaExiste = false;
    this.categoryForm.reset();
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
    this.currentPage = 1;
    this.loadCategories();
  }

  // Paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadCategories();
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
      this.loadCategories();
    } else {
      this.loadCategories();
    }
  }

  // Método helper para obtener mensajes de error específicos
  getErrorMessage(controlName: string): string {
    const control = this.categoryForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    const fieldName = controlName === 'nombre' ? 'El nombre' : 'La descripción';

    if (errors['required']) return `${fieldName} es obligatorio`;
    if (errors['minlength']) {
      const minLength = controlName === 'nombre' ? 3 : 10;
      return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }
    if (errors['maxlength']) {
      const maxLength = controlName === 'nombre' ? 50 : 200;
      return `${fieldName} no debe exceder ${maxLength} caracteres`;
    }
    if (errors['caracteresInvalidos']) return 'Solo se permiten letras, espacios y tildes';
    if (errors['espaciosExtremos']) return 'No debe tener espacios al inicio o final';
    if (errors['espaciosMultiples']) return 'No debe tener espacios múltiples consecutivos';
    if (errors['soloEspacios']) return `${fieldName} no puede contener solo espacios`;

    return 'Campo inválido';
  }

  toggleCategoryStatus(category: Category): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    // Primero verificar si tiene materiales
    this.categoryService.verificarMaterialesEnCategoria(category.idCategoria!).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response) => {
        if (response.tieneMateriales && !category.estado) {
          // Si está activando, permitir directamente
          this.confirmarCambioEstado(category);
        } else if (response.tieneMateriales && category.estado) {
          // Si está desactivando y tiene materiales, mostrar modal de reasignación
          this.categoriaAEliminar = category;
          this.materialesEnCategoria = response.materiales;
          this.cargarCategoriasParaReasignar(category.idCategoria!);
          this.isMaterialsModalOpen = true;
        } else {
          // No tiene materiales, cambiar estado directamente
          this.confirmarCambioEstado(category);
        }
      },
      error: (err) => {
        console.error('Error al verificar materiales:', err);
        this.notificationService.error('Error al verificar la categoría');
      }
    });
  }

  private confirmarCambioEstado(category: Category): void {
    const updatedCategory: Category = {
      ...category,
      estado: !category.estado
    };

    const actionText = updatedCategory.estado ? 'ACTIVAR CATEGORÍA' : 'DESACTIVAR CATEGORÍA';
    const message = `¿Estás seguro de ${updatedCategory.estado ? 'activar' : 'desactivar'} la categoría "${category.nombre}"?`;

    this.openConfirmModal(actionText, message, () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.categoryService.modificarCategoria(category.idCategoria!, updatedCategory).pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: () => {
          this.loadCategories();
          this.closeConfirmModal();
          this.notificationService.show(
            `Categoría ${updatedCategory.estado ? 'activada' : 'desactivada'} correctamente`,
            'info'
          );
        },
        error: () => {
          this.notificationService.show('Error al cambiar estado de categoría', 'error');
        }
      });
    });
  }

  cargarCategoriasParaReasignar(categoriaActualId: number): void {
    this.categoryService.listarCategorias(undefined, 'true', 0, 100).subscribe({
      next: (data) => {
        this.categoriasParaReasignar = data.content.filter(
          cat => cat.idCategoria !== categoriaActualId
        );
      }
    });
  }

  confirmarReasignacion(): void {
    if (this.isProcessing) return;

    if (!this.selectedNewCategoryId || !this.categoriaAEliminar) {
      this.notificationService.error('Debes seleccionar una categoría destino');
      return;
    }

    this.isProcessing = true;
    this.categoryService.reasignarMateriales(
      this.categoriaAEliminar.idCategoria!,
      this.selectedNewCategoryId
    ).subscribe({
      next: () => {
        const updatedCategory: Category = {
          ...this.categoriaAEliminar!,
          estado: false
        };

        this.categoryService.modificarCategoria(
          this.categoriaAEliminar!.idCategoria!,
          updatedCategory
        ).pipe(
          finalize(() => this.isProcessing = false)
        ).subscribe({
          next: () => {
            this.closeMaterialsModal();
            this.loadCategories();
            this.notificationService.show(
              'Materiales reasignados y categoría desactivada correctamente',
              'success'
            );
          },
          error: (err) => {
            console.error('Error al desactivar categoría:', err);
            this.closeMaterialsModal();
            this.loadCategories();
            this.notificationService.show(
              'Materiales reasignados pero hubo un error al desactivar la categoría',
              'error'
            );
          }
        });
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error al reasignar materiales:', err);
        this.notificationService.error('Error al reasignar materiales');
      }
    });
  }

  closeMaterialsModal(): void {
    this.isMaterialsModalOpen = false;
    this.materialesEnCategoria = [];
    this.categoriaAEliminar = null;
    this.selectedNewCategoryId = null;
  }
}
