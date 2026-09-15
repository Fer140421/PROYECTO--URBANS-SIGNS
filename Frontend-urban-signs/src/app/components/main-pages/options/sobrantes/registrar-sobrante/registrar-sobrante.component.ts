import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SobrantesService } from '../../../../../core/services/sobrantes/sobrantes.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
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

interface ResiduoReutilizable {
  id?: number;
  materialId: number;
  loteOrigenId?: number;
  trabajoId?: number;
  cantidad: number;
  unidad: string;
  ubicacion: string;
  estado: 'DISPONIBLE' | 'DESCARTADO';
  observaciones?: string;
  fechaRegistro: Date;
  usuarioRegistro: string;
}

interface RegistroReciente {
  id: number;
  material: string;
  cantidad: number;
  unidad: string;
  estado: string;
  fecha: Date;
}

@Component({
  selector: 'app-registrar-sobrante',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-sobrante.component.html',
  styleUrl: './registrar-sobrante.component.css'
})
export class RegistrarSobranteComponent {
  private sobrantesService = inject(SobrantesService);
  private router = inject(Router);
  private notificacionService = inject(NotificationService);
  @Input() contexto: ContextoMaterial = {
    materialId: 2,
    materialCodigo: 'LN-13OZ',
    materialNombre: 'Lona Front 13oz',
    unidad: 'm²'
  };

  @Output() volver = new EventEmitter<void>();

  residuoForm!: FormGroup;
  isSubmitting: boolean = false;
  fechaActual: Date = new Date();

  // Datos mockeados
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
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    this.residuoForm = this.fb.group({
      loteOrigenId: [null],
      trabajoId: [null],
      cantidad: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(10000)
      ]],
      unidad: ['', Validators.required],
      ubicacion: ['Almacén de residuos - Estante A', Validators.required],
      estado: ['DISPONIBLE', Validators.required],
      observaciones: ['', [Validators.maxLength(500)]]
    });

    if (this.contexto?.unidad) {
      this.residuoForm.patchValue({ unidad: this.contexto.unidad });
    }
  }

  getLoteSeleccionado(): LoteDisponible | undefined {
    const loteId = this.residuoForm.get('loteOrigenId')?.value;
    return this.lotesDisponibles.find(l => l.id === loteId);
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

    this.sobrantesService.registrar(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notificacionService.success('Residuo registrado exitosamente');
        this.router.navigate(['/home/list-stock']);
        this.limpiarFormulario();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al registrar residuo:', err);
        this.notificacionService.error('Error al registrar el residuo. Por favor, intente nuevamente.');
      }
    });
  }

  private marcarControlesComoTouched(): void {
    Object.keys(this.residuoForm.controls).forEach(key => {
      const control = this.residuoForm.get(key);
      control?.markAsTouched();
    });
  }

  limpiarFormulario(): void {
    this.residuoForm.reset({
      estado: 'DISPONIBLE',
      ubicacion: 'Almacén de residuos - Estante A'
    });

    if (this.contexto?.unidad) {
      this.residuoForm.patchValue({ unidad: this.contexto.unidad });
    }

    Object.keys(this.residuoForm.controls).forEach(key => {
      const control = this.residuoForm.get(key);
      control?.markAsUntouched();
    });
  }

  get f() {
    return this.residuoForm.controls;
  }

  cancelar() {
    this.router.navigate(['/home/list-stock']);
    this.limpiarFormulario();
  }

}
