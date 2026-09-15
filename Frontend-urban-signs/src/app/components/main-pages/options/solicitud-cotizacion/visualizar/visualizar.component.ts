import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualizar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visualizar.component.html',
  styleUrl: './visualizar.component.css'
})
export class VisualizarComponent {
  private trabajosService = inject(TrabajosService);
  private fb = inject(FormBuilder);

  @Input() mostrar: boolean = false;
  @Input() solicitud: any | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  guardando = false;
  mensajeError = '';
  listTrabajos: any[] = [];

  idSolicitud!: number;
  modificacionForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTrabajos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solicitud'] && this.solicitud) {
      this.cargarDatosEnFormulario(this.solicitud);
    }
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

  getNombreTrabajo(idTrabajo: number): string {
    const trabajo = this.listTrabajos.find(t => t.id === idTrabajo);
    return trabajo ? trabajo.nombre : 'Trabajo no encontrado';
  }

  getAreaTotal(): number {
    if (!this.solicitud?.trabajos) return 0;
    return this.solicitud.trabajos.reduce((total: number, trabajo: any) => {
      return total + (trabajo.areaTotal || 0);
    }, 0);
  }

  getCostoTotal(): number {
    if (!this.solicitud?.trabajos) return 0;
    return this.solicitud.trabajos.reduce((total: number, trabajo: any) => {
      return total + (trabajo.subtotal || 0);
    }, 0);
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

  private cargarDatosEnFormulario(solicitud: any): void {
    console.log('Cargando solicitud:', solicitud);
    while (this.trabajos.length !== 0) {
      this.trabajos.removeAt(0);
    }
    this.modificacionForm.patchValue({
      estado: solicitud.estado,
      prioridad: solicitud.prioridad,
      observaciones: solicitud.observaciones
    });
    this.solicitud = solicitud;
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

}