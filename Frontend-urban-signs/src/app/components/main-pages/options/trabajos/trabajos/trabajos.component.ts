import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Category } from '../../../../../core/models/category/category.model';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { Trabajo, TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-trabajos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    ViewToggleComponent,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ActionIconButtonComponent
  ],
  templateUrl: './trabajos.component.html',
  styleUrl: './trabajos.component.css'
})
export class TrabajosComponent {
  @ViewChild('photoInput') photoInput?: ElementRef<HTMLInputElement>;

  viewMode: 'list' | 'cards' = 'cards';
  notificationService = inject(NotificationService);
  trabajoService = inject(TrabajosService);
  fb = inject(FormBuilder);

  trabajos: Trabajo[] = [];
  isLoading = true;
  selectedTrabajoId: number | null = null;

  isModalOpen = false;
  isEditing = false;
  isProcessing = false;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmTitle: string = '';
  confirmCallback: (() => void) | null = null;
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;

  trabajoForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  readonly MAX_FILE_SIZE_MB = 5;
  Math = Math;

  filterEstado: boolean = true;

  ngOnInit(): void {
    this.loadTrabajos();
    this.initForm();
  }

  initForm(): void {
    this.trabajoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // ✅ Cargar trabajos con paginación
  loadTrabajos(page: number = this.currentPage - 1): void {
    this.isLoading = true;
    this.trabajoService.listar(page, this.pageSize, this.searchTerm, this.filterEstado)
      .subscribe(data => {
        this.trabajos = data.content;
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      });
  }

  // Aplicar filtros
  applyFilters(): void {
    this.currentPage = 1; // Resetear paginación al aplicar filtro
    this.loadTrabajos(0);
  }

  // Navegación de páginas
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadTrabajos(page - 1);
  }

  // ✅ Crear trabajo
  createTrabajo(): void {
    if (this.isProcessing) return;

    if (this.trabajoForm.invalid || !this.selectedFile) {
      this.notificationService.show('Debes completar los campos y subir una foto', 'error');
      return;
    }

    const dto = this.trabajoForm.value;
    this.isProcessing = true;

    this.trabajoService.crear(dto, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadTrabajos();
        this.closeModal();
        this.notificationService.show('Trabajo creado con éxito', 'success');
      },
      error: (err) => {
        console.error(err);
        this.notificationService.show('Error al crear el trabajo', 'error');
      }
    });
  }

  // ✅ Editar trabajo
  updateTrabajo(): void {
    if (this.isProcessing) return;
    if (!this.selectedTrabajoId) return;
    if (this.trabajoForm.invalid) {
      this.notificationService.show('Debes completar los campos', 'error');
      return;
    }

    const dto = this.trabajoForm.value;
    this.isProcessing = true;

    this.trabajoService.editar(this.selectedTrabajoId, dto, this.selectedFile ?? undefined).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.loadTrabajos();
        this.closeModal();
        this.notificationService.show('Trabajo actualizado con éxito', 'success');
      },
      error: () => {
        this.notificationService.show('Error al actualizar el trabajo', 'error');
      }
    });
  }

  // ✅ Submit (decide entre crear o editar)
  onSubmit(): void {
    if (this.isProcessing) return;

    if (this.isEditing) {
      this.updateTrabajo();
    } else {
      this.createTrabajo();
    }
  }

  // ✅ Modal crear
  openCreateModal(): void {
    if (this.isProcessing) return;

    this.selectedTrabajoId = null;
    this.isEditing = false;
    this.trabajoForm.reset();
    this.resetImageState();
    this.isModalOpen = true;
  }

  // ✅ Modal editar
  openEditModal(trabajo: Trabajo): void {
    if (this.isProcessing) return;

    this.selectedTrabajoId = trabajo.idTrabajo;
    this.isEditing = true;
    this.resetImageState(trabajo.foto);
    this.trabajoForm.patchValue({
      nombre: trabajo.nombre,
      descripcion: trabajo.descripcion
    });
    this.isModalOpen = true;
  }

  // ✅ Subida de archivo
  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tamaño máximo (opcional)
    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) {
      this.notificationService.show(`El archivo no puede superar ${maxSizeMB} MB`, 'error');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    // Generar vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  private resetImageState(preview: string | null = null): void {
    this.selectedFile = null;
    this.imagePreview = preview;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }


  // ✅ Confirm modal


  closeModal(): void {
    this.isModalOpen = false;
    this.selectedTrabajoId = null;
    this.isEditing = false;
    this.trabajoForm.reset();
    this.resetImageState();
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.confirmMessage = '';
    this.confirmTitle = '';
    this.confirmCallback = null;
  }

  // ✅ Paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTrabajos();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTrabajos();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }



  openConfirmModal(type: 'eliminar' | 'activar', trabajo: Trabajo): void {
    if (this.isProcessing) return;

    this.confirmTitle = type === 'eliminar' ? 'Eliminar Servicio' : 'Activar Servicio';
    this.confirmMessage = type === 'eliminar'
      ? '¿Estás seguro de eliminar este Servicio?'
      : '¿Quieres activar este Servicio?';

    this.confirmCallback = () => {
      if (this.isProcessing) return;

      const serviceCall = type === 'eliminar'
        ? this.trabajoService.eliminarLogico(trabajo.idTrabajo)
        : this.trabajoService.activar(trabajo.idTrabajo);

      this.isProcessing = true;
      serviceCall.pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: () => {
          this.loadTrabajos();
          this.closeConfirmModal();
          this.notificationService.show(
            type === 'eliminar' ? 'Trabajo eliminado correctamente' : 'Trabajo activado correctamente',
            type === 'eliminar' ? 'info' : 'success'
          );
        },
        error: () => {
          this.notificationService.show(
            type === 'eliminar' ? 'Error al eliminar el trabajo' : 'Error al activar el trabajo',
            'error'
          );
        }
      });
    };

    this.isConfirmModalOpen = true;
  }


  confirm(): void {
    if (this.isProcessing) return;

    if (this.confirmCallback) {
      this.confirmCallback();
    }
  }


}
