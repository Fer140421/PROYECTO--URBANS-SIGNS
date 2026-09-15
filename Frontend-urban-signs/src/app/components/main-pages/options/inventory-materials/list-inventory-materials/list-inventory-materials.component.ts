import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { CategorySimpleDTO } from '../../../../../core/models/category/CategorySimpleDTO.model';
import { MaterialTrabajoRegistroDTO } from '../../../../../core/models/materialTrabajo/MaterialTrabajoRegistroDTO.model';
import imageCompression from 'browser-image-compression';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-inventory-materials',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-inventory-materials.component.html',
  styleUrl: './list-inventory-materials.component.css'
})
export class ListInventoryMaterialsComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';

  isModalOpen = false;
  form!: FormGroup;
  fb = inject(FormBuilder);
  notificationService = inject(NotificationService)
  materialService = inject(MaterialService);
  router = inject(Router);
  isMaterialModalOpen = false;
  materialSeleccionado: any | null = null;

  Math = Math;
  selectedFile!: File;
  listCategorias: CategorySimpleDTO[] = [];
  listMaterials: any[] = [];
  isLoading = true;
  isProcessing = false;
  selectedCategoriaId: number | null = null;
  filterStatus:  'EN_MANTENIMIENTO' | 'DADO_DE_BAJA' | 'DISPONIBLE' | 'EN_USO' = 'DISPONIBLE';
  materialSelected: any;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  searchTerm = '';
  previewImage: string | null = null;
  materialId: number = 0;

  estadoConfig: Record<string, {
    titulo: string;
    mensaje: string;
    color: string;
    icono: string;
    boton: string;
  }> = {
      DISPONIBLE: {
        titulo: 'Reactivar herramienta',
        mensaje: '¿Deseas volver a marcar esta herramienta como disponible?',
        color: 'green',
        icono: 'ph-check-circle',
        boton: 'Reactivar'
      },
      EN_MANTENIMIENTO: {
        titulo: 'Enviar a mantenimiento',
        mensaje: 'La herramienta quedará fuera de uso temporalmente.',
        color: 'yellow',
        icono: 'ph-wrench',
        boton: 'Enviar'
      },
      DADO_DE_BAJA: {
        titulo: 'Dar de baja herramienta',
        mensaje: 'Esta acción es irreversible. La herramienta no podrá usarse nuevamente.',
        color: 'red',
        icono: 'ph-x-circle',
        boton: 'Dar de baja'
      }
    };


  // Getters para acceder fácilmente a los controles
  get nombre() { return this.form?.get('nombre'); }
  get marca() { return this.form?.get('marca'); }
  get modelo() { return this.form?.get('modelo'); }
  get ubicacion() { return this.form?.get('ubicacion'); }
  get observaciones() { return this.form?.get('observaciones'); }

  ngOnInit(): void {
    this.loadMateriales();
  }

  loadMateriales() {
    this.isLoading = true;
    this.materialService.getMateriales(this.currentPage - 1, this.pageSize, this.filterStatus, this.searchTerm).subscribe(data => {
      this.listMaterials = data.content;
      this.totalItems = data.totalElements
      this.totalPages = data.totalPages
      console.log(this.listMaterials);
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  openEditModal(material: any) {
    if (this.isProcessing) return;

    this.isModalOpen = true;
    this.materialId = material.idHerramienta;
    this.initForm();
    this.previewImage = material.foto || null;

    this.form.patchValue({
      nombre: material.nombre,
      marca: material.marca,
      modelo: material.modelo,
      ubicacion: material.ubicacion,
      observaciones: material.observaciones
    });
  }

  removeImage(): void {
    this.selectedFile = undefined!;
    this.previewImage = '';
  }

  closeConfirmModal(): void {
    this.isModalOpen = false;
    this.form.reset();
    this.previewImage = null;
  }

  private validarSoloLetrasNumerosEspacios(control: AbstractControl) {
    if (!control.value) return null;
    const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s]*$/;
    return regex.test(control.value) ? null : { pattern: true };
  }

  private validarLetrasNumerosGuiones(control: AbstractControl) {
    if (!control.value) return null;
    const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\-\s]*$/;
    return regex.test(control.value) ? null : { pattern: true };
  }

  private validarTextoConCaracteresEspeciales(control: AbstractControl) {
    if (!control.value) return null;
    const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s\-_.,;:()&@#%!]*$/;
    return regex.test(control.value) ? null : { pattern: true };
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.validarSoloLetrasNumerosEspacios.bind(this)
      ]],
      marca: ['', [
        Validators.maxLength(50),
        this.validarSoloLetrasNumerosEspacios.bind(this)
      ]],
      modelo: ['', [
        Validators.maxLength(50),
        this.validarLetrasNumerosGuiones.bind(this)
      ]],
      ubicacion: ['', [
        Validators.maxLength(100),
        this.validarTextoConCaracteresEspeciales.bind(this)
      ]],
      observaciones: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  // Paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMateriales();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMateriales();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadMateriales();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadMateriales();
    }
  }

  modMaterial() {
    if (this.isProcessing) return;

    if (this.form.invalid) {
      this.marcarControlesComoSucios();
      this.notificationService.error('Por favor complete los campos requeridos correctamente');
      return;
    }

    // Validar que al menos un campo tenga cambios
    if (!this.form.dirty && !this.selectedFile) {
      this.notificationService.warning('No se detectaron cambios para guardar');
      return;
    }

    const materialEditado: any = this.form.value;

    this.isProcessing = true;
    this.materialService.update(this.materialId, materialEditado, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.success('Material actualizado con éxito');
        this.form.reset();
        this.closeConfirmModal();
        this.previewImage = null;
        this.selectedFile = undefined!;
        this.loadMateriales(); // refrescar lista
      },
      error: (err) => {
        console.error('Error al actualizar material', err);
        const errorMessage = err.error?.message || 'Error al actualizar el material';
        this.notificationService.error(errorMessage);
      }
    });
  }

  private marcarControlesComoSucios(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  async onFileSelectedEdit(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 5; // Aumentado a 5MB como indica el placeholder
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.notificationService.error('Solo se permiten archivos JPG, PNG y JPEG');
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.notificationService.warning(`El archivo supera el tamaño máximo de ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    try {
      const options = {
        maxSizeMB: MAX_FILE_SIZE_MB,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.8,
      };
      const compressedFile = await imageCompression(file, options);

      if (compressedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.notificationService.error('No se pudo comprimir la imagen a un tamaño adecuado');
        return;
      }

      this.selectedFile = compressedFile;

      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result as string;
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      this.notificationService.error('Error al procesar la imagen');
    }
  }

  verDetallesMaterial(material: any) {
    this.materialSeleccionado = material;
    this.isMaterialModalOpen = true;
  }

  closeMaterialModal() {
    this.isMaterialModalOpen = false;
    this.materialSeleccionado = null;
  }

  cancelar() {
    this.router.navigate(['/home/list-inventory-materials']);
  }

  search(): void {
    this.currentPage = 1;

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadMateriales();
    } else {
      this.loadMateriales();
    }
  }

  isEstadoModalOpen = false;
  nuevoEstado: 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA' | 'DISPONIBLE' = 'EN_MANTENIMIENTO';

  abrirModalEstado(material: any, estado: 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA' | 'DISPONIBLE') {
    this.materialSeleccionado = material;
    this.nuevoEstado = estado;
    this.isEstadoModalOpen = true;
  }

  closeEstadoModal() {
    this.isEstadoModalOpen = false;
    this.materialSeleccionado = null;
  }

  confirmarCambioEstado() {
    if (this.isProcessing) return;
    if (!this.materialSeleccionado) return;

    this.isProcessing = true;
    this.materialService.darCambiarEstado(this.materialSeleccionado.idHerramienta, this.nuevoEstado)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: (res) => {
          this.notificationService.success(`Herramienta "${res.nombre}" ahora está ${res.estadoActual}`);
          // Actualizar lista local
          if (this.nuevoEstado === 'DADO_DE_BAJA') {
            this.listMaterials = this.listMaterials.filter(h => h.idHerramienta !== res.idHerramienta);
          } else {
            const index = this.listMaterials.findIndex(h => h.idHerramienta === res.idHerramienta);
            if (index !== -1) this.listMaterials[index].estadoActual = res.estadoActual;
          }
          this.closeEstadoModal();
        },
        error: (err) => {
          this.notificationService.error('No se pudo actualizar el estado');
          console.error(err);
        }
      });
  }

}
