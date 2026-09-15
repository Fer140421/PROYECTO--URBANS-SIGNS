import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modificar-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modificar-cotizacion.component.html',
  styleUrl: './modificar-cotizacion.component.css'
})
export class ModificarCotizacionComponent {
  private cotizacionService = inject(CotizacionService);
  private trabajosService = inject(TrabajosService);
  private materialesService = inject(MaterialProduccionService);
  private fb = inject(FormBuilder);

  @Input() mostrar: boolean = false;
  @Input() cotizacion: any | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  guardando = false;
  mensajeError = '';
  listTrabajos: any[] = [];
  listMateriales: any[] = [];
  modificacionForm!: FormGroup;

  // Getters para acceder fácilmente a los controles
  get estado() { return this.modificacionForm.get('estado'); }
  get fechaEmision() { return this.modificacionForm.get('fechaEmision'); }
  get fechaCaducado() { return this.modificacionForm.get('fechaCaducado'); }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTrabajos();
    this.cargarMateriales();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cotizacion'] && this.cotizacion) {
      this.cargarDatosEnFormulario(this.cotizacion);
    }

    if (changes['mostrar'] && this.mostrar) {
      this.mensajeError = '';
      this.guardando = false;
    }
  }

  // ========== VALIDACIONES PERSONALIZADAS ==========

  private validarFechas(control: AbstractControl): ValidationErrors | null {
    const fechaEmision = this.modificacionForm?.get('fechaEmision')?.value;
    const fechaCaducado = control.value;

    if (!fechaEmision || !fechaCaducado) {
      return null;
    }

    const fechaEmisionDate = new Date(fechaEmision);
    const fechaCaducadoDate = new Date(fechaCaducado);

    if (fechaCaducadoDate <= fechaEmisionDate) {
      return { fechaAnterior: 'La fecha de caducidad debe ser posterior a la fecha de emisión' };
    }

    return null;
  }

  private validarFechaFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const fecha = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      return { fechaInvalida: 'La fecha no puede ser anterior al día de hoy' };
    }

    return null;
  }

  private validarNumeroEntero(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const valor = control.value;
    if (!Number.isInteger(Number(valor))) {
      return { pattern: 'Solo se permiten números enteros' };
    }

    return null;
  }

  private validarDecimal(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const valor = control.value.toString();
    if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
      return { pattern: 'Formato de precio inválido (ej: 10.50)' };
    }

    return null;
  }

  // ========== INICIALIZACIÓN ==========

  private inicializarFormulario(): void {
    this.modificacionForm = this.fb.group({
      estado: ['', Validators.required],
      fechaEmision: ['', [Validators.required, this.validarFechaFutura.bind(this)]],
      fechaCaducado: ['', [Validators.required, this.validarFechaFutura.bind(this), this.validarFechas.bind(this)]],
      trabajos: this.fb.array([], Validators.required)
    });
  }

  private crearTrabajoFormGroup(): FormGroup {
    return this.fb.group({
      idCotizacionTrabajo: [null],
      idSolicitudTrabajo: ['', Validators.required],
      idTrabajo: ['', Validators.required],
      nombreTrabajo: [''],
      cantidad: [1, [Validators.required, Validators.min(1), this.validarNumeroEntero.bind(this)]],
      costoUnitario: [0, [Validators.required, Validators.min(0), this.validarDecimal.bind(this)]],
      subtotal: [0],
      materiales: this.fb.array([])
    });
  }

  private crearMaterialFormGroup(): FormGroup {
    return this.fb.group({
      idMaterial: ['', Validators.required],
      nombreMaterial: ['']
    });
  }

  // ========== MÉTODOS DE VALIDACIÓN EN TEMPLATE ==========

  esTrabajoInvalido(index: number): boolean {
    const trabajo = this.trabajos.at(index);
    return trabajo.invalid && (trabajo.dirty || trabajo.touched);
  }

  esMaterialInvalido(trabajoIndex: number, materialIndex: number): boolean {
    const material = this.getMaterialControl(trabajoIndex, materialIndex, 'idMaterial');
    return material.invalid && (material.dirty || material.touched);
  }

  getTrabajoControl(index: number, controlName: string): AbstractControl {
    return this.trabajos.at(index).get(controlName) as AbstractControl;
  }

  getMaterialControl(trabajoIndex: number, materialIndex: number, controlName: string): AbstractControl {
    const materiales = this.getMateriales(trabajoIndex);
    return materiales.at(materialIndex).get(controlName) as AbstractControl;
  }

  // ========== CARGA DE DATOS ==========

  private cargarTrabajos(): void {
    this.trabajosService.listarSimple().subscribe({
      next: (trabajos) => {
        this.listTrabajos = trabajos;
        console.log('Trabajos cargados:', this.listTrabajos);
      },
      error: (err) => {
        console.error('Error al cargar trabajos:', err);
        this.error.emit('Error al cargar la lista de trabajos');
      }
    });
  }

  private cargarMateriales(): void {
    this.materialesService.getSimpleMateriales().subscribe({
      next: (materiales) => {
        this.listMateriales = materiales;
      },
      error: (err) => {
        console.error('Error al cargar materiales:', err);
        this.error.emit('Error al cargar la lista de materiales');
      }
    });
  }

  private cargarDatosEnFormulario(cotizacion: any): void {
    console.log('Cargando cotización:', cotizacion);

    // Limpiar trabajos existentes
    while (this.trabajos.length !== 0) {
      this.trabajos.removeAt(0);
    }

    this.modificacionForm.patchValue({
      estado: cotizacion.estado || '',
      fechaEmision: cotizacion.fechaEmision,
      fechaCaducado: cotizacion.fechaCaducado
    });

    if (cotizacion.trabajos && cotizacion.trabajos.length > 0) {
      cotizacion.trabajos.forEach((trabajo: any) => {
        const trabajoForm = this.crearTrabajoFormGroup();

        trabajoForm.patchValue({
          idCotizacionTrabajo: trabajo.idCotizacionTrabajo,
          idSolicitudTrabajo: trabajo.idSolicitudTrabajo,
          idTrabajo: trabajo.idTrabajo,
          nombreTrabajo: trabajo.nombreTrabajo,
          cantidad: trabajo.cantidad,
          costoUnitario: trabajo.costoUnitario,
          subtotal: trabajo.subtotal
        });

        const materialesArray = trabajoForm.get('materiales') as FormArray;
        if (trabajo.materiales && trabajo.materiales.length > 0) {
          trabajo.materiales.forEach((material: any) => {
            const materialForm = this.crearMaterialFormGroup();
            materialForm.patchValue({
              idMaterial: material.idMaterial,
              nombreMaterial: material.nombreMaterial
            });
            materialesArray.push(materialForm);
          });
        }

        this.trabajos.push(trabajoForm);
      });
    } else {
      this.agregarTrabajo();
    }

    // Marcar como pristine después de cargar
    this.modificacionForm.markAsPristine();
  }

  // ========== MÉTODOS DEL FORMULARIO ==========

  get trabajos(): FormArray {
    return this.modificacionForm.get('trabajos') as FormArray;
  }

  getMateriales(trabajoIndex: number): FormArray {
    return this.trabajos.at(trabajoIndex).get('materiales') as FormArray;
  }

  agregarTrabajo(): void {
    this.trabajos.push(this.crearTrabajoFormGroup());
  }

  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.removeAt(index);
      this.recalcularCostoTotal();
    }
  }

  agregarMaterial(trabajoIndex: number): void {
    const materiales = this.getMateriales(trabajoIndex);
    materiales.push(this.crearMaterialFormGroup());
  }

  removerMaterial(trabajoIndex: number, materialIndex: number): void {
    const materiales = this.getMateriales(trabajoIndex);
    materiales.removeAt(materialIndex);
  }

  onMaterialChange(trabajoIndex: number, materialIndex: number): void {
    const materiales = this.getMateriales(trabajoIndex);
    const material = materiales.at(materialIndex);
    const idMaterial = material.get('idMaterial')?.value;

    if (idMaterial) {
      const materialSeleccionado = this.listMateriales.find(m => m.id === idMaterial);
      if (materialSeleccionado) {
        material.patchValue({
          nombreMaterial: materialSeleccionado.nombre
        });
      }
    }
  }

  onTrabajoChange(index: number): void {
    const trabajo = this.trabajos.at(index);
    const idTrabajo = trabajo.get('idTrabajo')?.value;

    if (idTrabajo) {
      const trabajoSeleccionado = this.listTrabajos.find(t => t.id === idTrabajo);
      if (trabajoSeleccionado) {
        trabajo.patchValue({
          nombreTrabajo: trabajoSeleccionado.nombre,
          costoUnitario: trabajoSeleccionado.costo_unitario || 0
        });
      }
    }

    this.calcularSubtotalTrabajo(index);
  }

  onCantidadCostoChange(index: number): void {
    this.calcularSubtotalTrabajo(index);
  }

  private calcularSubtotalTrabajo(index: number): void {
    const trabajo = this.trabajos.at(index);
    const cantidad = trabajo.get('cantidad')?.value || 0;
    const costoUnitario = trabajo.get('costoUnitario')?.value || 0;
    const subtotal = cantidad * costoUnitario;

    console.log(`Cálculo subtotal trabajo ${index}:`, { cantidad, costoUnitario, subtotal });

    trabajo.patchValue({ subtotal }, { emitEvent: false });
    this.recalcularCostoTotal();
  }

  getCostoTotal(): number {
    return this.trabajos.controls.reduce((total, trabajo) => {
      return total + (trabajo.get('subtotal')?.value || 0);
    }, 0);
  }

  private recalcularCostoTotal(): void {
    const total = this.getCostoTotal();
    console.log('Costo total actualizado:', total);
  }

  // ========== VALIDACIÓN FINAL DEL FORMULARIO ==========

  esFormularioValido(): boolean {
    if (!this.modificacionForm.valid) {
      console.log('Formulario principal inválido');
      return false;
    }

    if (this.trabajos.length === 0) {
      console.log('No hay trabajos');
      return false;
    }

    // Validar cada trabajo
    const trabajosValidos = this.trabajos.controls.every((trabajo, index) => {
      const trabajoGroup = trabajo as FormGroup;
      const esValido = trabajoGroup.valid;

      if (!esValido) {
        console.log(`Trabajo ${index} inválido:`, trabajoGroup.errors);
      }

      return esValido;
    });

    console.log('Formulario válido:', trabajosValidos && this.modificacionForm.valid);
    return trabajosValidos && this.modificacionForm.valid;
  }

  // ========== GUARDADO ==========

  onGuardar(): void {
    if (this.guardando) return;

    if (!this.esFormularioValido() || !this.cotizacion?.idCotizacion) {
      this.marcarControlesComoSucios();
      this.mensajeError = 'Por favor complete todos los campos requeridos correctamente';
      return;
    }

    // Validar que al menos un trabajo tenga materiales
    const tieneMateriales = this.trabajos.controls.some(trabajo => {
      const materiales = (trabajo as FormGroup).get('materiales') as FormArray;
      return materiales.length > 0;
    });

    if (!tieneMateriales) {
      this.mensajeError = 'Al menos un trabajo debe tener materiales asociados';
      return;
    }

    const request = {
      trabajos: this.trabajos.value.map((t: any) => ({
        idCotizacionTrabajo: t.idCotizacionTrabajo,
        cantidad: t.cantidad,
        costoUnitario: t.costoUnitario,
        subtotal: t.cantidad * t.costoUnitario,
        materiales: t.materiales.map((m: any) => ({
          idMaterial: Number(m.idMaterial)
        }))
      }))
    };

    console.log('Request enviado al backend:', JSON.stringify(request, null, 2));

    this.guardando = true;
    this.mensajeError = '';

    this.cotizacionService.modificarCotizacion(this.cotizacion.idCotizacion, request).pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: () => {
        console.log('✅ Cotización modificada correctamente');
        this.guardando = false;
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('❌ Error al modificar la cotización:', err);
        this.guardando = false;
        this.mensajeError = err.error?.message || 'No se pudo modificar la cotización';
        this.error.emit(this.mensajeError);
      }
    });
  }

  private marcarControlesComoSucios(): void {
    // Marcar controles del formulario principal
    Object.keys(this.modificacionForm.controls).forEach(key => {
      const control = this.modificacionForm.get(key);
      control?.markAsTouched();
    });

    // Marcar controles de trabajos
    this.trabajos.controls.forEach(trabajo => {
      const grupo = trabajo as FormGroup;
      Object.keys(grupo.controls).forEach(key => {
        const control = grupo.get(key);
        control?.markAsTouched();
      });

      // Marcar controles de materiales
      const materiales = grupo.get('materiales') as FormArray;
      materiales?.controls.forEach((material) => {
        const materialGrupo = material as FormGroup;
        Object.keys(materialGrupo.controls).forEach(key => {
          const control = materialGrupo.get(key);
          control?.markAsTouched();
        });
      });
    });
  }

  // ========== UTILIDADES ==========

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
