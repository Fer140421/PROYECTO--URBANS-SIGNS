import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
import { UnidadMedidaService } from '../../../../../core/services/unidadMedida/unidad-medida.service';
import imageCompression from 'browser-image-compression';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-inventory-production',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register-inventory-production.component.html',
  styleUrl: './register-inventory-production.component.css'
})
export class RegisterInventoryProductionComponent implements OnInit {
  isProcessing = false;

  categorias = inject(CategoryService);
  notificationService = inject(NotificationService);
  materialProduccion = inject(MaterialProduccionService);
  unidadService = inject(UnidadMedidaService);
  router = inject(Router);
  listCategories: any[] = [];
  listMaterials: any[] = [];
  listUnidades: any[] = [];

  materialForm!: FormGroup;
  selectedFile!: File;
  imagePreview: string | null = null;
  readonly MAX_FILE_SIZE_MB = 5;
  tipoControlSeleccionado: string = '';
  mostrarDimensiones: boolean = false;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialProduccionService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadUnidades();
    this.configurarCapitalizacionAutomatica();
  }

  configurarCapitalizacionAutomatica(): void {
    // Lista de campos que deben capitalizarse
    const camposACapitalizar = [
      'nombre',
      'caracteristica',
      'color',
      'ubicacion'
    ];

    camposACapitalizar.forEach(campo => {
      this.materialForm.get(campo)?.valueChanges.subscribe(value => {
        if (value && typeof value === 'string' && value.length > 0) {
          const capitalizado = this.capitalizarTexto(value);
          if (value !== capitalizado) {
            this.materialForm.get(campo)?.setValue(capitalizado, { emitEvent: false });
          }
        }
      });
    });
  }

  private capitalizarTexto(texto: string): string {
    if (!texto) return texto;

    const palabrasExcluidas = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'con', 'para', 'por'];

    return texto
      .split(' ')
      .map((palabra, index) => {
        if (index === 0) {
          return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        }

        if (palabrasExcluidas.includes(palabra.toLowerCase())) {
          return palabra.toLowerCase();
        }

        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
  }

  private normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .trim()
      .replace(/\s+/g, ' ');
  }

  loadUnidades() {
    this.unidadService.listarAll().subscribe(data => {
      this.listUnidades = data;
      console.log(this.listUnidades)
    });
  }

  loadCategories(): void {
    this.categorias.getSimpleCategories().subscribe({
      next: (data) => {
        this.listCategories = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.notificationService.error('Error al cargar las categorías');
      }
    });
  }

  registrarMaterial(): void {
    if (this.isProcessing) return;

    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      this.notificationService.error('Complete todos los campos requeridos');
      return;
    }

    if (!this.selectedFile) {
      this.notificationService.error('Debe seleccionar una imagen del material');
      return;
    }

    const material = {
      idCategoria: this.materialForm.get('id_categoria')?.value,
      idUnidad: this.materialForm.get('id_unidad')?.value,
      nombre: this.normalizarTexto(this.materialForm.get('nombre')?.value),
      caracteristica: this.normalizarTexto(this.materialForm.get('caracteristica')?.value),
      color: this.normalizarTexto(this.materialForm.get('color')?.value),

      tipoControl: this.materialForm.get('tipo_control')?.value,

      anchoRollo: this.materialForm.get('ancho_rollo')?.value,
      largoRolloNuevo: this.materialForm.get('largo_rollo_nuevo')?.value,
      anchoPlancha: this.materialForm.get('ancho_plancha')?.value,
      altoPlancha: this.materialForm.get('alto_plancha')?.value,

      cantidadInicial: this.materialForm.get('cantidad_inicial')?.value || 0,
      stockMinimo: this.materialForm.get('stock_minimo')?.value || 0,
      porcentajeDesperdicio: this.materialForm.get('porcentaje_desperdicio')?.value || 10,
      ubicacion: this.normalizarTexto(this.materialForm.get('ubicacion')?.value) || 'Sin ubicación'
    };

    console.log('Material a enviar:', material);

    this.isProcessing = true;
    this.materialService.crear(material, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response: any) => {
        this.notificationService.show('Material registrado con éxito', 'success');
        console.log('Material creado:', response);

        this.materialForm.reset();
        this.removeImage();
        this.tipoControlSeleccionado = '';
        this.mostrarDimensiones = false;

        this.router.navigate(['/home/list-inventory-production']);
      },
      error: (err) => {
        console.error('Error al crear material:', err);

        // Mostrar mensaje de error específico si viene del backend
        const errorMessage = err.error?.message || 'Hubo un error al registrar el material';
        this.notificationService.error(errorMessage);
      }
    });
  }

  removeImage(): void {
    this.selectedFile = undefined!;
    this.imagePreview = null;
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`El archivo supera el tamaño máximo de ${MAX_FILE_SIZE_MB} MB`);
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
        alert('No se pudo comprimir la imagen a un tamaño adecuado');
        return;
      }

      this.selectedFile = compressedFile;

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      alert('Error al procesar la imagen');
    }
  }

  cancelar() {
    if (this.isProcessing) return;

    this.materialForm.reset();
    this.router.navigate(['/home/list-inventory-production']);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.convertFileToBase64(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private convertFileToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.materialForm.patchValue({
        foto: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  }

  private initForm(): void {
    this.materialForm = this.fb.group({
      id_categoria: ['', Validators.required],
      id_unidad: ['', Validators.required],
      nombre: ['', Validators.required],
      caracteristica: ['', Validators.required],
      color: ['', Validators.required],

      tipo_control: ['', Validators.required],

      ancho_rollo: [null],
      largo_rollo_nuevo: [null],

      ancho_plancha: [null],
      alto_plancha: [null],

      cantidad_inicial: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]],
      porcentaje_desperdicio: [10, [Validators.min(0), Validators.max(100)]],
      ubicacion: ['']
    });
  }

  onTipoControlChange(): void {
    const tipoControl = this.materialForm.get('tipo_control')?.value;
    this.tipoControlSeleccionado = tipoControl;
    this.mostrarDimensiones = ['ROLLO', 'PLANCHA'].includes(tipoControl);

    this.clearValidations();

    if (tipoControl === 'ROLLO') {
      this.materialForm.get('ancho_rollo')?.setValidators([Validators.required, Validators.min(0.001)]);
      this.materialForm.get('ancho_rollo')?.updateValueAndValidity();
    } else if (tipoControl === 'PLANCHA') {
      this.materialForm.get('ancho_plancha')?.setValidators([Validators.required, Validators.min(0.001)]);
      this.materialForm.get('alto_plancha')?.setValidators([Validators.required, Validators.min(0.001)]);
      this.materialForm.get('ancho_plancha')?.updateValueAndValidity();
      this.materialForm.get('alto_plancha')?.updateValueAndValidity();
    }
  }

  private clearValidations(): void {
    ['ancho_rollo', 'largo_rollo_nuevo', 'ancho_plancha', 'alto_plancha'].forEach(field => {
      this.materialForm.get(field)?.clearValidators();
      this.materialForm.get(field)?.updateValueAndValidity();
    });
  }

  calcularM2PorPlancha(): number {
    const ancho = this.materialForm.get('ancho_plancha')?.value;
    const alto = this.materialForm.get('alto_plancha')?.value;

    if (ancho && alto && ancho > 0 && alto > 0) {
      return ancho * alto;
    }
    return 0;
  }

}
