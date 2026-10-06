import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';

@Component({
  selector: 'app-modificar-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modificar-cotizacion.component.html',
  styleUrl: './modificar-cotizacion.component.css'
})
export class ModificarCotizacionComponent implements OnInit, OnChanges {
  private cotizacionService = inject(CotizacionService);
  private trabajosService = inject(TrabajosService);
  private fb = inject(FormBuilder);

  @Input() mostrar: boolean = false;
  @Input() cotizacion: any | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  guardando = false;
  mensajeError = '';
  listTrabajos: any[] = [];
  modificacionForm!: FormGroup;
  imagenModalUrl: string | null = null;

  // Getters para controles
  get estado() { return this.modificacionForm.get('estado'); }
  get fechaEmision() { return this.modificacionForm.get('fechaEmision'); }
  get fechaCaducado() { return this.modificacionForm.get('fechaCaducado'); }
  get trabajos(): FormArray { return this.modificacionForm.get('trabajos') as FormArray; }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTrabajos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cotizacion'] && this.cotizacion) {
      this.cargarDatosEnFormulario(this.cotizacion);
    }

    if (changes['mostrar'] && this.mostrar) {
      this.mensajeError = '';
      this.guardando = false;
      this.imagenModalUrl = null;
      if (this.cotizacion) {
        this.cargarDatosEnFormulario(this.cotizacion);
      }
    }
  }

  // ========== VALIDACIONES PERSONALIZADAS ==========

  private validarNumeroEntero(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }
    const valor = Number(control.value);
    if (!Number.isInteger(valor) || valor <= 0) {
      return { pattern: 'Solo se permiten números enteros mayores a 0' };
    }
    return null;
  }

  private validarDecimal(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === undefined || control.value === '') {
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
      estado: ['PENDIENTE'],
      fechaEmision: [''],
      fechaCaducado: [''],
      trabajos: this.fb.array([], Validators.required)
    });
  }

  private crearTrabajoFormGroup(trabajo?: any): FormGroup {
    const cantidad = trabajo?.cantidad ? Number(trabajo.cantidad) : 1;
    const costoUnitario = trabajo?.costoUnitario != null ? Number(trabajo.costoUnitario) : 0;
    const subtotal = trabajo?.subtotal != null ? Number(trabajo.subtotal) : (cantidad * costoUnitario);

    return this.fb.group({
      idCotizacionTrabajo: [trabajo?.idCotizacionTrabajo || null],
      idSolicitudTrabajo: [trabajo?.idSolicitudTrabajo || ''],
      idTrabajo: [trabajo?.idTrabajo || '', Validators.required],
      nombreTrabajo: [trabajo?.nombreTrabajo || ''],
      cantidad: [cantidad, [Validators.required, Validators.min(1), this.validarNumeroEntero.bind(this)]],
      costoUnitario: [costoUnitario, [Validators.required, Validators.min(0), this.validarDecimal.bind(this)]],
      subtotal: [subtotal],
      material: [trabajo?.material || ''],
      base: [trabajo?.base || null],
      altura: [trabajo?.altura || null],
      area_total: [trabajo?.area_total || trabajo?.areaTotal || null],
      unidadMedida: [trabajo?.unidadMedida || 'm'],
      descripcion: [trabajo?.descripcion || ''],
      archivoReferencia: [trabajo?.archivoReferencia || null],
      materiales: this.fb.array([])
    });
  }

  private crearMaterialFormGroup(): FormGroup {
    return this.fb.group({
      idMaterial: ['', Validators.required],
      nombreMaterial: ['']
    });
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  esTrabajoInvalido(index: number): boolean {
    const trabajo = this.trabajos.at(index);
    return trabajo.invalid && (trabajo.dirty || trabajo.touched);
  }

  getTrabajoControl(index: number, controlName: string): AbstractControl {
    return this.trabajos.at(index).get(controlName) as AbstractControl;
  }

  // ========== CARGA DE DATOS ==========

  private cargarTrabajos(): void {
    this.trabajosService.listarSimple().subscribe({
      next: (trabajos) => {
        this.listTrabajos = trabajos;
      },
      error: (err) => {
        console.error('Error al cargar trabajos:', err);
        this.error.emit('Error al cargar la lista de trabajos');
      }
    });
  }

  private cargarDatosEnFormulario(cotizacion: any): void {
    while (this.trabajos.length !== 0) {
      this.trabajos.removeAt(0);
    }

    this.modificacionForm.patchValue({
      estado: cotizacion.estado || 'PENDIENTE',
      fechaEmision: cotizacion.fechaEmision ? this.formatearFecha(cotizacion.fechaEmision) : '',
      fechaCaducado: cotizacion.fechaCaducado ? this.formatearFecha(cotizacion.fechaCaducado) : ''
    });

    if (cotizacion.trabajos && cotizacion.trabajos.length > 0) {
      cotizacion.trabajos.forEach((trabajo: any) => {
        const trabajoForm = this.crearTrabajoFormGroup(trabajo);

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

    this.modificacionForm.markAsPristine();
  }

  // ========== ACCIONES DE FORMULARIO ==========

  agregarTrabajo(): void {
    this.trabajos.push(this.crearTrabajoFormGroup());
  }

  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.removeAt(index);
      this.recalcularCostoTotal();
    }
  }

  onTrabajoChange(index: number): void {
    const trabajo = this.trabajos.at(index);
    const idTrabajo = trabajo.get('idTrabajo')?.value;

    if (idTrabajo) {
      const trabajoSeleccionado = this.listTrabajos.find(t => t.id === Number(idTrabajo) || t.id === idTrabajo);
      if (trabajoSeleccionado) {
        trabajo.patchValue({
          nombreTrabajo: trabajoSeleccionado.nombre,
          costoUnitario: trabajo.get('costoUnitario')?.value || trabajoSeleccionado.costo_unitario || 0
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
    const cantidad = Number(trabajo.get('cantidad')?.value) || 0;
    const costoUnitario = Number(trabajo.get('costoUnitario')?.value) || 0;
    const subtotal = Math.round(cantidad * costoUnitario * 100) / 100;

    trabajo.patchValue({ subtotal }, { emitEvent: false });
    this.recalcularCostoTotal();
  }

  getCostoTotal(): number {
    return this.trabajos.controls.reduce((total, trabajo) => {
      return total + (Number(trabajo.get('subtotal')?.value) || 0);
    }, 0);
  }

  private recalcularCostoTotal(): void {
    // Para disparo reactivo si se requiere
  }

  // ========== METADATOS Y HELPERS DEL CLIENTE ==========

  getClienteNombre(): string {
    return this.cotizacion?.clienteNombre || this.cotizacion?.cliente?.nombre || 'Cliente sin registrar';
  }

  getClienteTipo(): string {
    return this.cotizacion?.clienteTipo || this.cotizacion?.cliente?.tipoCliente || 'Persona Natural';
  }

  getClienteDocumento(): string {
    return this.cotizacion?.clienteDocumento || this.cotizacion?.cliente?.documento || '—';
  }

  getClienteTelefono(): string {
    return this.cotizacion?.clienteTelefono || this.cotizacion?.cliente?.telefono || '—';
  }

  getClienteCorreo(): string {
    return this.cotizacion?.clienteCorreo || this.cotizacion?.cliente?.correo || '—';
  }

  getClienteDireccion(): string {
    return this.cotizacion?.clienteDireccion || this.cotizacion?.cliente?.direccion || '—';
  }

  getTotalUnidades(): number {
    if (!this.trabajos || this.trabajos.length === 0) {
      if (!this.cotizacion?.trabajos) return 0;
      return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
        return total + (Number(trabajo.cantidad) || 1);
      }, 0);
    }
    return this.trabajos.controls.reduce((sum, ctrl) => sum + (Number(ctrl.get('cantidad')?.value) || 0), 0);
  }

  getAreaTotal(): number {
    if (this.trabajos && this.trabajos.length > 0) {
      return this.trabajos.controls.reduce((sum, ctrl) => {
        const area = Number(ctrl.get('area_total')?.value) || 0;
        const cant = Number(ctrl.get('cantidad')?.value) || 1;
        return sum + (area * cant);
      }, 0);
    }
    if (!this.cotizacion?.trabajos) return 0;
    return this.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      const area = Number(trabajo.area_total || trabajo.areaTotal) || 0;
      const cant = Number(trabajo.cantidad) || 1;
      return total + (area * cant);
    }, 0);
  }

  estaVencida(): boolean {
    if (!this.cotizacion?.fechaCaducado) return false;
    const hoy = new Date();
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    return hoy > fechaCaducidad;
  }

  diasRestantes(): number {
    if (!this.cotizacion?.fechaCaducado) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    const diferencia = fechaCaducidad.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  abrirModalImagen(url: string): void {
    this.imagenModalUrl = url;
  }

  cerrarModalImagen(): void {
    this.imagenModalUrl = null;
  }

  // ========== VALIDACIÓN Y GUARDADO ==========

  esFormularioValido(): boolean {
    if (!this.modificacionForm.valid) {
      return false;
    }
    if (this.trabajos.length === 0) {
      return false;
    }
    return this.trabajos.controls.every(t => t.valid);
  }

  onGuardar(): void {
    if (this.guardando) return;

    if (!this.esFormularioValido() || !this.cotizacion?.idCotizacion) {
      this.marcarControlesComoSucios();
      this.mensajeError = 'Por favor complete todos los campos requeridos correctamente';
      return;
    }

    const request = {
      trabajos: this.trabajos.value.map((t: any) => ({
        idCotizacionTrabajo: t.idCotizacionTrabajo,
        cantidad: Number(t.cantidad),
        costoUnitario: Number(t.costoUnitario),
        subtotal: Number(t.cantidad) * Number(t.costoUnitario),
        material: t.material ? t.material.trim() : '',
        unidadMedida: t.unidadMedida ? t.unidadMedida.trim().toLowerCase() : 'm',
        materiales: (t.materiales || []).map((m: any) => ({
          idMaterial: Number(m.idMaterial)
        }))
      }))
    };

    this.guardando = true;
    this.mensajeError = '';

    this.cotizacionService.modificarCotizacion(this.cotizacion.idCotizacion, request).pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado.emit();
        this.cerrar.emit();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = err.error?.message || 'No se pudo modificar la cotización';
        this.error.emit(this.mensajeError);
      }
    });
  }

  private marcarControlesComoSucios(): void {
    Object.keys(this.modificacionForm.controls).forEach(key => {
      this.modificacionForm.get(key)?.markAsTouched();
    });

    this.trabajos.controls.forEach(trabajo => {
      const grupo = trabajo as FormGroup;
      Object.keys(grupo.controls).forEach(key => {
        grupo.get(key)?.markAsTouched();
      });
    });
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
