import { Component, inject, OnInit } from '@angular/core';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';

interface TrabajoSolicitud {
  idSolicitudTrabajo: number;
  trabajoNombre: string;
  descripcion: string;
  material?: string;
  archivoReferencia?: string;
  cantidad: number;
  base: number;
  altura: number;
  areaTotal: number;
}

interface Solicitud {
  idSolicitud: number;
  codSolicitud: string;
  clienteNombre: string;
  tipoCliente: string;
  tipoPersonaEmpresa: string;
  fechaSolicitud: string;
  estado: string;
  origen?: string;
  archivoReferencia?: string;
  observaciones: string;
  trabajos: TrabajoSolicitud[];
}

@Component({
  selector: 'app-registrar-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-cotizacion.component.html',
  styleUrl: './registrar-cotizacion.component.css'
})
export class RegistrarCotizacionComponent implements OnInit {
  private trabajoService = inject(TrabajosService);
  private clienteService = inject(ClientesService);
  private solicitudService = inject(SolicitudService);
  private cotizacionService = inject(CotizacionService);
  private notificacionService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  cotizacionForm!: FormGroup;
  solicitud?: Solicitud;
  isLoading = false;
  cotizacionCreada = false;
  cotizacionResultado?: any;

  preciosUnitariosPersonalizados: { [key: number]: number } = {};
  materialesPersonalizados: { [key: number]: string } = {};
  private readonly COSTO_BASE_POR_M2 = 0;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosIniciales();
  }

  private inicializarFormulario(): void {
    this.cotizacionForm = this.fb.group({
      id_cliente: ['', Validators.required],
      fecha_emision: ['', Validators.required],
      fecha_caducado: ['', Validators.required]
    });
  }

  private cargarDatosIniciales(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadSolicitud(id);
    }
    this.configurarFechasAutomaticas();
  }

  private loadSolicitud(id: number): void {
    this.solicitudService.getSolicitudDetalle(id).subscribe({
      next: (data: Solicitud) => {
        this.solicitud = data;
        if (data.trabajos) {
          data.trabajos.forEach((trabajo: TrabajoSolicitud, index: number) => {
            if (trabajo.material) {
              this.materialesPersonalizados[index] = trabajo.material;
            }
          });
        }
        this.cotizacionForm.patchValue({
          id_cliente: data.idSolicitud
        });
      },
      error: (err) => {
        console.error('Error al cargar la solicitud', err);
        this.notificacionService.error('Error al cargar la solicitud');
      }
    });
  }

  private formatFechaLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private configurarFechasAutomaticas(): void {
    const hoy = new Date();
    const caducidad = new Date();
    caducidad.setDate(hoy.getDate() + 15);

    this.cotizacionForm.patchValue({
      fecha_emision: this.formatFechaLocal(hoy),
      fecha_caducado: this.formatFechaLocal(caducidad)
    });
  }

  getCostoTotal(): number {
    if (!this.solicitud?.trabajos) return 0;

    return this.solicitud.trabajos.reduce((total: number, trabajo: TrabajoSolicitud, index: number) => {
      return total + this.getSubtotalTrabajo(index);
    }, 0);
  }

  getCostoUnitarioTrabajo(index: number): number {
    const valor = this.preciosUnitariosPersonalizados[index];
    const costo = valor !== undefined ? Number(valor) : this.COSTO_BASE_POR_M2;
    return isNaN(costo) ? 0 : costo;
  }

  actualizarPrecioUnitario(index: number, nuevoPrecio: number): void {
    this.preciosUnitariosPersonalizados[index] = Number(nuevoPrecio) || 0;
  }

  getMaterialTrabajo(index: number): string {
    if (this.materialesPersonalizados[index] !== undefined) {
      return this.materialesPersonalizados[index];
    }
    return this.solicitud?.trabajos?.[index]?.material || '';
  }

  actualizarMaterialTrabajo(index: number, nuevoMaterial: string): void {
    this.materialesPersonalizados[index] = nuevoMaterial;
  }

  getSubtotalTrabajo(index: number): number {
    const trabajo = this.solicitud?.trabajos?.[index];
    if (!trabajo) return 0;

    const subtotalTrabajo = (trabajo.cantidad || 0) * this.getCostoUnitarioTrabajo(index);
    return subtotalTrabajo;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    if (this.cotizacionForm.valid) {
      this.isLoading = true;

      const codCotizacion = 'COT-' + Date.now().toString().slice(-6);

      const cotizacionData = {
        codCotizacion: codCotizacion,
        idSolicitud: this.solicitud?.idSolicitud,
        trabajos: this.solicitud?.trabajos.map((trabajo: any, index: number) => ({
          idSolicitudTrabajo: trabajo.idSolicitudTrabajo,
          cantidad: trabajo.cantidad,
          costoUnitario: this.getCostoUnitarioTrabajo(index),
          subtotal: this.getSubtotalTrabajo(index),
          material: this.getMaterialTrabajo(index),
          materiales: []
        }))
      };

      this.cotizacionService.registrarCotizacion(cotizacionData).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (result) => {
          this.cotizacionResultado = result;
          this.cotizacionCreada = true;
          this.isLoading = false;
          this.notificacionService.success('Cotización creada exitosamente');
          this.router.navigate(['/home/list-cotizaciones']);
        },
        error: (error) => {
          console.error('Error al crear cotización:', error);
          this.isLoading = false;
          this.notificacionService.error('Error al crear la cotización');
        }
      });
    } else {
      this.marcarControlesComoSucios();
    }
  }

  private marcarControlesComoSucios(): void {
    Object.keys(this.cotizacionForm.controls).forEach(key => {
      const control = this.cotizacionForm.get(key);
      control?.markAsTouched();
    });
    this.notificacionService.warning('Por favor complete todos los campos requeridos');
  }

  cancelar(): void {
    this.router.navigate(['/home/list-cotizaciones']);
  }
}
