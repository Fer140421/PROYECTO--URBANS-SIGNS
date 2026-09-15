import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import imageCompression from 'browser-image-compression';
import { UnidadMedidaService } from '../../../../../core/services/unidadMedida/unidad-medida.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-inventory-production',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-inventory-production.component.html',
  styleUrl: './list-inventory-production.component.css'
})
export class ListInventoryProductionComponent {
  viewMode: 'list' | 'cards' = 'list';
  materiales: any[] = [];
  lisCategorias: any[] = [];
  listMaterials: any[] = [];
  listUnidades: any[] = [];
  categoriaService = inject(CategoryService);
  materialService = inject(MaterialProduccionService);
  unidadService = inject(UnidadMedidaService);
  notificationService = inject(NotificationService);
  materialForm!: FormGroup;
  fb = inject(FormBuilder);
  isMaterialModalOpen = false;
  isMaterialViewModalOpen = false;
  materialSeleccionadoId!: number;
  previewImage: string | null = null;
  selectedFile!: File;
  filterStatus: boolean = true;
  materialSelected: any;
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  searchTerm = '';
  material!: any;
  Math = Math;
  itemsPerPage = 5;
  filteredCategories: any[] = [];
  listMateriales: any[] = [];
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    this.loadMaterials();
    this.loadCategories();
  }

  loadCategories() {
    this.categoriaService.getSimpleCategories().subscribe((data) => {
      this.lisCategorias = data;
    });
  }

  cambiarEstado(estado: boolean) {
    this.filterStatus = estado
    this.loadMaterials();
  }


  loadUnidades() {
    this.unidadService.listarAll().subscribe(data => {
      this.listUnidades = data;
      console.log(this.listUnidades)
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadMaterials();
    }
  }

  searchMaterials(): void {
    this.currentPage = 1;

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadMaterials();
    } else {
      this.loadMaterials();
    }
  }

  initForm() {
    this.materialForm = this.fb.group({
      id_categoria: ['', Validators.required],
      id_unidad: ['', Validators.required],
      nombre: ['', Validators.required],
      caracteristica: ['', Validators.required],
      color: [''],
      base: [''],
      altura: ['']
    });
  }

  loadMaterials() {
    this.isLoading = true;
    this.materialService.listar(this.searchTerm, this.filterStatus, this.currentPage - 1, this.pageSize).subscribe((data) => {
      this.totalItems = data.totalItems;
      this.totalPages = data.totalPages;
      this.materiales = data.content;
      console.log(this.materiales)
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  removeImage(): void {
    this.selectedFile = undefined!;
    this.previewImage = null;
  }

  openMaterialModal(material: any) {
    if (this.isProcessing) return;

    this.isMaterialModalOpen = true;
    if (!this.materialForm) {
      this.initForm();
      this.loadUnidades();
    }

    this.previewImage = material.foto;
    this.materialSeleccionadoId = material.idMaterial;
    this.materialForm.patchValue({
      id_categoria: material.categoria.idCategoria,
      nombre: material.nombre,
      caracteristica: material.caracteristica,
      id_unidad: material.unidad.idUnidad,
      color: material.color,
      base: material.base,
      altura: material.altura
    });
  }

  closeMaterialModal() {
    this.isMaterialModalOpen = false;
    this.materialForm.reset();
  }

  modificarMaterial() {
    if (this.isProcessing) return;

    if (this.materialForm.invalid) {
      this.notificationService.error('Complete todos los campos requeridos');
      return;
    }

    const material = {
      idCategoria: this.materialForm.get('id_categoria')?.value,
      idUnidad: this.materialForm.get('id_unidad')?.value,
      nombre: this.materialForm.get('nombre')?.value.trim(),
      caracteristica: this.materialForm.get('caracteristica')?.value,
      color: this.materialForm.get('color')?.value,
      base: this.materialForm.get('base')?.value,
      altura: this.materialForm.get('altura')?.value,
    };

    this.isProcessing = true;
    this.materialService.actualizar(this.materialSeleccionadoId, material, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.show('Material actualizado con éxito', 'success');
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Hubo un error al actualizar el material');
      }
    });
  }


  // Abrir modal de solo visualización
  openMaterialViewModal(material: any) {
    this.isMaterialViewModalOpen = true;
    this.material = material;
  }

  // Cerrar modal
  closeMaterialViewModal() {
    this.isMaterialViewModalOpen = false;
  }

  async onFileSelectedEdit(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2;

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
      this.notificationService.error('Error al procesar la imagen');
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMaterials();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMaterials();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadMaterials();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedCategories(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

}
