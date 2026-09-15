import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { CategorySimpleDTO } from '../../../../../core/models/category/CategorySimpleDTO.model';
import { MaterialTrabajoRegistroDTO } from '../../../../../core/models/materialTrabajo/MaterialTrabajoRegistroDTO.model';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import imageCompression from 'browser-image-compression';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-inventory-materials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-inventory-materials.component.html',
  styleUrl: './register-inventory-materials.component.css'
})
export class RegisterInventoryMaterialsComponent implements OnInit {
  isProcessing = false;

  form!: FormGroup;
  fb = inject(FormBuilder);
  notificactionService = inject(NotificationService);
  materialService = inject(MaterialService);
  router = inject(Router);

  selectedCategoriaId: number | null = null;

  selectedFile!: File;
  imagePreview: string | null = null;
  readonly MAX_FILE_SIZE_MB = 2;
  readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        this.validarNombreMaterial.bind(this)
      ]],
      marca: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        this.validarTextoAlfanumerico.bind(this)
      ]],
      modelo: ['', [
        Validators.minLength(2),
        Validators.maxLength(50),
        this.validarTextoAlfanumerico.bind(this)
      ]],
      ubicacion: ['', [
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      observaciones: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  // ============ VALIDADORES PERSONALIZADOS ============

  /**
   * Valida que el nombre del material sea válido
   * - No solo espacios en blanco
   * - Solo letras, números, espacios y guiones
   * - No caracteres especiales extraños
   */
  private validarNombreMaterial(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const valor = control.value.trim();

    // No permitir solo espacios
    if (valor.length === 0) {
      return {
        soloEspacios: {
          mensaje: 'El nombre no puede contener solo espacios'
        }
      };
    }

    // Permitir letras (incluidas ñ y tildes), números, espacios, guiones y paréntesis
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s\-().,]+$/;
    if (!regex.test(valor)) {
      return {
        caracteresInvalidos: {
          mensaje: 'El nombre contiene caracteres no permitidos'
        }
      };
    }

    return null;
  }

  /**
   * Valida texto alfanumérico para marca y modelo
   */
  private validarTextoAlfanumerico(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const valor = control.value.trim();
    if (valor.length === 0) return null; // Es opcional, así que vacío es válido

    // Permitir letras, números, espacios, guiones y algunos caracteres especiales
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s\-_.]+$/;
    if (!regex.test(valor)) {
      return {
        caracteresInvalidos: {
          mensaje: 'Contiene caracteres no permitidos'
        }
      };
    }

    return null;
  }

  // ============ VALIDACIÓN DE IMAGEN ============

  /**
   * Valida que la imagen cumpla con los requisitos antes de comprimir
   */
  private validarImagen(file: File): { valido: boolean; mensaje?: string } {
    // Validar tipo de archivo
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valido: false,
        mensaje: 'Formato no permitido. Solo se aceptan JPG, PNG o WEBP'
      };
    }

    // Validar tamaño máximo (antes de comprimir)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB antes de comprimir
    if (file.size > maxSizeBytes) {
      return {
        valido: false,
        mensaje: 'La imagen es demasiado grande (máx. 10MB)'
      };
    }

    // Validar dimensiones mínimas (opcional)
    return { valido: true };
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Validar imagen
    const validacion = this.validarImagen(file);
    if (!validacion.valido) {
      this.notificactionService.error(validacion.mensaje!);
      event.target.value = ''; // Limpiar input
      return;
    }

    try {
      // Opciones de compresión
      const options = {
        maxSizeMB: this.MAX_FILE_SIZE_MB,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.8
      };

      this.notificactionService.info('Procesando imagen...');
      const compressedFile = await imageCompression(file, options);

      // Verificar que la compresión fue exitosa
      if (compressedFile.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.notificactionService.error('No se pudo reducir el tamaño de la imagen lo suficiente');
        event.target.value = '';
        return;
      }

      this.selectedFile = compressedFile;

      // Generar preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.notificactionService.success(`Imagen cargada (${(compressedFile.size / 1024).toFixed(0)} KB)`);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      this.notificactionService.error('Error al procesar la imagen');
      event.target.value = '';
    }
  }

  removeImage(): void {
    this.selectedFile = undefined!;
    this.imagePreview = null;
    this.notificactionService.show('Imagen eliminada');
  }

  // ============ MÉTODOS AUXILIARES PARA MOSTRAR ERRORES ============

  obtenerErrorCampo(campo: string): string {
    const control = this.form.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    // Errores estándar
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    // Errores personalizados
    if (errors['soloEspacios']) return errors['soloEspacios'].mensaje;
    if (errors['caracteresInvalidos']) return errors['caracteresInvalidos'].mensaje;

    return 'Campo inválido';
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Valida que el formulario esté completo y correcto
   */
  formularioValido(): boolean {
    // Marcar todos los campos como touched para mostrar errores
    this.form.markAllAsTouched();

    // Verificar que haya una imagen seleccionada
    if (!this.selectedFile) {
      this.notificactionService.warning('Debe seleccionar una imagen de la herramienta');
      return false;
    }

    // Verificar que el formulario sea válido
    if (this.form.invalid) {
      // Encontrar el primer campo inválido
      const camposInvalidos = Object.keys(this.form.controls)
        .filter(key => this.form.get(key)?.invalid);

      if (camposInvalidos.length > 0) {
        const primerCampo = camposInvalidos[0];
        const error = this.obtenerErrorCampo(primerCampo);
        this.notificactionService.error(`Error en ${this.obtenerNombreCampo(primerCampo)}: ${error}`);
      }
      return false;
    }

    return true;
  }

  /**
   * Obtiene el nombre legible de un campo
   */
  private obtenerNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      nombre: 'Nombre del material',
      marca: 'Marca',
      modelo: 'Modelo',
      ubicacion: 'Ubicación',
      observaciones: 'Observaciones'
    };
    return nombres[campo] || campo;
  }

  submit(): void {
    if (this.isProcessing) return;

    if (!this.formularioValido()) {
      return;
    }

    // Limpiar espacios en blanco de los campos de texto
    const formValue = { ...this.form.value };
    Object.keys(formValue).forEach(key => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim();
      }
    });

    const nuevoMaterial: MaterialTrabajoRegistroDTO = formValue;

    this.isProcessing = true;
    this.materialService.create(nuevoMaterial, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (res) => {
        this.notificactionService.success('Herramienta registrada exitosamente');
        this.limpiarFormulario();
        this.router.navigate(['/home/list-inventory-materials']);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.notificactionService.error(
          err.error?.message || 'Error al registrar la herramienta. Intente nuevamente.'
        );
      }
    });
  }

  cancel(): void {
    if (this.isProcessing) return;

    if (this.form.dirty || this.imagePreview) {
      // Si hay cambios, pedir confirmación
      if (confirm('¿Está seguro de cancelar? Se perderán todos los datos ingresados.')) {
        this.limpiarFormulario();
        this.notificactionService.show('Registro cancelado');
        this.router.navigate(['/home/list-inventory-materials']);
      }
    } else {
      this.router.navigate(['/home/list-inventory-materials']);
    }
  }

  /**
   * Limpia completamente el formulario
   */
  private limpiarFormulario(): void {
    this.form.reset();
    this.imagePreview = null;
    this.selectedFile = undefined!;
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  /**
   * Obtiene el contador de caracteres para un campo
   */
  obtenerContadorCaracteres(campo: string): string {
    const control = this.form.get(campo);
    if (!control) return '0';

    const valor = control.value || '';
    return valor.length.toString();
  }

  /**
   * Verifica si un campo tiene el máximo de caracteres
   */
  campoEnMaximo(campo: string): boolean {
    const control = this.form.get(campo);
    if (!control) return false;

    const maxLength = control.errors?.['maxlength']?.requiredLength;
    if (!maxLength) return false;

    const valor = control.value || '';
    return valor.length >= maxLength;
  }

}
