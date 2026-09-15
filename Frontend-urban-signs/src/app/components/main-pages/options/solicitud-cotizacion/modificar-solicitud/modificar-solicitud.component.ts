import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-modificar-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modificar-solicitud.component.html',
  styleUrl: './modificar-solicitud.component.css'
})
export class ModificarSolicitudComponent implements OnInit, OnChanges {
  private solicitudService = inject(SolicitudService);
  private trabajosService = inject(TrabajosService);
  private fb = inject(FormBuilder);

  // Inputs: Datos que recibe el componente
  @Input() mostrar: boolean = false;
  @Input() solicitud: any | null = null;

  // Outputs: Eventos que emite el componente
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  // Estado interno
  guardando = false;
  mensajeError = '';
  listTrabajos: any[] = [];

  // Formulario
  idSolicitud!: number;
  modificacionForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTrabajos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando cambia la solicitud, cargar los datos en el formulario
    if (changes['solicitud'] && this.solicitud) {
      this.cargarDatosEnFormulario(this.solicitud);
    }

    // Cuando se muestra el modal, resetear el estado
    if (changes['mostrar'] && this.mostrar) {
      this.mensajeError = '';
      this.guardando = false;
    }
  }

  private inicializarFormulario(): void {
    this.modificacionForm = this.fb.group({
      estado: ['PENDIENTE', Validators.required],
      observaciones: [''],
      trabajos: this.fb.array([this.crearTrabajoFormGroup()])
    });
  }

  private crearTrabajoFormGroup(): FormGroup {
    return this.fb.group({
      id_trabajo: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      base: [0, [Validators.required, Validators.min(0.1)]],
      altura: [0, [Validators.required, Validators.min(0.1)]],
      descripcion: [''],
      area_total: [0],
      costo_unitario: [0],
      subtotal: [0]
    });
  }

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

  get trabajos(): FormArray {
    return this.modificacionForm.get('trabajos') as FormArray;
  }

  agregarTrabajo(): void {
    this.trabajos.push(this.crearTrabajoFormGroup());
  }

  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.removeAt(index);
    }
  }

  calcularAreaTrabajo(index: number): void {
    const trabajo = this.trabajos.at(index);
    const base = trabajo.get('base')?.value || 0;
    const altura = trabajo.get('altura')?.value || 0;
    const cantidad = trabajo.get('cantidad')?.value || 1;

    const areaTotal = base * altura * cantidad;
    trabajo.patchValue({ area_total: areaTotal });
  }

  // ========== CÁLCULOS ==========

  getAreaTotal(): number {
    return this.trabajos.controls.reduce((total, trabajo) => {
      return total + (trabajo.get('area_total')?.value || 0);
    }, 0);
  }

  getCostoTotal(): number {
    return this.trabajos.controls.reduce((total, trabajo) => {
      return total + (trabajo.get('subtotal')?.value || 0);
    }, 0);
  }

  // ========== MÉTODOS PRINCIPALES ==========

  private cargarDatosEnFormulario(solicitud: any): void {
    console.log('Cargando solicitud:', solicitud);

    // Limpiar trabajos existentes
    while (this.trabajos.length !== 0) {
      this.trabajos.removeAt(0);
    }

    // Cargar datos principales
    this.modificacionForm.patchValue({
      estado: solicitud.estado,
      prioridad: solicitud.prioridad,
      observaciones: solicitud.observaciones
    });

    // Guardar la solicitud actual para el template
    this.solicitud = solicitud;

    // Cargar trabajos
    if (solicitud.trabajos && solicitud.trabajos.length > 0) {
      solicitud.trabajos.forEach((trabajo: any) => {
        const trabajoForm = this.crearTrabajoFormGroup();
        trabajoForm.patchValue({
          id_trabajo: trabajo.idTrabajo,
          cantidad: trabajo.cantidad,
          base: trabajo.base,
          altura: trabajo.altura,
          descripcion: trabajo.descripcion,
          area_total: trabajo.areaTotal
        });
        this.trabajos.push(trabajoForm);
      });

    } else {
      this.trabajos.push(this.crearTrabajoFormGroup());
    }
  }


  onGuardar(): void {
    if (this.guardando) return;

    const request = {
      idCliente: this.solicitud.cliente.idCliente,
      observaciones: this.modificacionForm.get('observaciones')?.value,
      trabajos: this.trabajos.value.map((t: any) => ({
        idTrabajo: t.id_trabajo,
        cantidad: t.cantidad,
        base: t.base,
        altura: t.altura,
        descripcion: t.descripcion
      }))
    };

    console.log('Request enviado al backend:', request);

    this.guardando = true;

    this.solicitudService.modificarSolicitud(this.solicitud.idSolicitud, request).pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: (response) => {
        console.log('Solicitud modificada correctamente:', response);
        this.guardando = false;
        this.guardado.emit(response);
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('Error al modificar la solicitud:', err);
        this.guardando = false;
        this.error.emit('No se pudo modificar la solicitud');
      }
    });
  }

  private marcarControlesComoSucios(): void {
    Object.keys(this.modificacionForm.controls).forEach(key => {
      const control = this.modificacionForm.get(key);
      control?.markAsTouched();
    });

    this.trabajos.controls.forEach(trabajo => {
      const grupo = trabajo as FormGroup;
      Object.keys(grupo.controls).forEach(key => {
        const control = grupo.get(key);
        control?.markAsTouched();
      });
    });
  }

}
