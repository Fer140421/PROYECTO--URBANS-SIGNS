import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SobrantesService } from '../../../../../core/services/sobrantes/sobrantes.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResiduoMaterial } from '../../../../../core/models/sobrantes/sobrantes.model';
import { finalize } from 'rxjs';
interface LoteDisponible {
  id: number;
  codigo: string;
  cantidadDisponible: number;
  materialId: number;
}

interface Trabajo {
  id: number;
  descripcion: string;
  fecha: Date;
  cliente: string;
}

interface ContextoMaterial {
  materialId: number;
  materialCodigo: string;
  materialNombre: string;
  unidad?: string;
}

interface ResiduoReutilizable extends ResiduoMaterial {
  id?: number;
  fechaRegistro?: string;
  usuarioRegistro?: string;
}

@Component({
  selector: 'app-modificar-sobrante',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modificar-sobrante.component.html',
  styleUrl: './modificar-sobrante.component.css'
})
export class ModificarSobranteComponent {
  private sobrantesService = inject(SobrantesService);
  private notificacionService = inject(NotificationService);

  // Inputs del componente
  @Input() mostrar: boolean = false; // NECESITAS ESTA PROP para controlar si se muestra
  @Input() residuoId!: number;
  @Input() contexto: ContextoMaterial = {
    materialId: 1,
    materialCodigo: 'LN-13OZ',
    materialNombre: 'Lona Front 13oz',
    unidad: 'm²'
  };

  // Outputs del componente
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  residuoForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;

  // Información del residuo existente
  fechaRegistro: Date = new Date();
  usuarioRegistro: string = 'Usuario Sistema';

  // Datos mockeados (deberían venir de servicios)
  lotesDisponibles: LoteDisponible[] = [
    { id: 1, codigo: 'LOTE-2024-001', cantidadDisponible: 50.5, materialId: 1 },
    { id: 2, codigo: 'LOTE-2024-002', cantidadDisponible: 30.2, materialId: 1 },
    { id: 3, codigo: 'LOTE-2024-003', cantidadDisponible: 15.8, materialId: 1 },
    { id: 4, codigo: 'LOTE-2024-004', cantidadDisponible: 42.3, materialId: 2 }
  ];

  trabajosDisponibles: Trabajo[] = [
    { id: 1001, descripcion: 'Banner promocional 3x6', fecha: new Date('2024-03-15'), cliente: 'TechCorp SA' },
    { id: 1002, descripcion: 'Lonas para feria industrial', fecha: new Date('2024-03-14'), cliente: 'Industrial Group' },
    { id: 1003, descripcion: 'Vinilos decorativos oficina', fecha: new Date('2024-03-13'), cliente: 'Creative Studios' },
    { id: 1004, descripcion: 'Roll up publicitarios', fecha: new Date('2024-03-12'), cliente: 'Marketing Pro' }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Solo cargar si hay un residuoId y si el modal está mostrando
    if (this.mostrar && this.residuoId) {
      this.cargarResiduo();
    }
  }

  ngOnChanges(): void {
    // Esto se llama cuando cambian los inputs
    if (this.mostrar && this.residuoId) {
      this.cargarResiduo();
    }
  }

  private cargarResiduo(): void {
    this.isLoading = true;

    this.sobrantesService.obtenerPorId(this.residuoId).subscribe({
      next: (residuo) => {
        this.inicializarFormulario(residuo);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar residuo:', err);
        this.notificacionService.error('Error al cargar los datos del residuo');
        this.isLoading = false;
        this.cerrarModal();
      }
    });
  }

  private inicializarFormulario(residuo: ResiduoReutilizable): void {
    this.residuoForm = this.fb.group({
      loteOrigenId: [residuo.idLoteOrigen || null],
      trabajoId: [null],
      cantidad: [residuo.cantidad, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(10000)
      ]],
      unidad: [residuo.unidad || '', Validators.required],
      ubicacion: [residuo.ubicacion || 'Almacén de residuos - Estante A', Validators.required],
      estado: [residuo.estado || 'DISPONIBLE', Validators.required],
      observaciones: [residuo.observaciones || '', [Validators.maxLength(500)]]
    });

    if (residuo.fechaRegistro) {
      this.fechaRegistro = new Date(residuo.fechaRegistro);
    }

    if (residuo.usuarioRegistro) {
      this.usuarioRegistro = residuo.usuarioRegistro;
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.marcarControlesComoTouched();

    if (this.residuoForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const payload: ResiduoMaterial = {
      idMaterial: this.contexto.materialId,
      idLoteOrigen: this.residuoForm.value.loteOrigenId || null,
      cantidad: this.residuoForm.value.cantidad,
      unidad: this.residuoForm.value.unidad,
      ubicacion: this.residuoForm.value.ubicacion,
      estado: this.residuoForm.value.estado,
      observaciones: this.residuoForm.value.observaciones || ''
    };

    console.log('Payload para actualizar:', payload);

    this.sobrantesService.actualizar(this.residuoId, payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificacionService.success('Residuo actualizado exitosamente');
        this.actualizado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al actualizar residuo:', err);
        this.notificacionService.error('Error al actualizar el residuo. Por favor, intente nuevamente.');
      }
    });
  }

  private marcarControlesComoTouched(): void {
    Object.keys(this.residuoForm.controls).forEach(key => {
      const control = this.residuoForm.get(key);
      control?.markAsTouched();
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  get f() {
    return this.residuoForm.controls;
  }
}
