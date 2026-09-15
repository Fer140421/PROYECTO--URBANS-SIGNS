import { Component, inject, OnInit } from '@angular/core';
import { Cliente, CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { ClienteBusquedaDTO } from '../../../../../core/models/Clientes/busqueda.model';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { finalize } from 'rxjs';

interface TrabajoSolicitud {
  idSolicitudTrabajo: number;
  trabajoNombre: string;
  descripcion: string;
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
  private materialService = inject(MaterialProduccionService);
  private cotizacionService = inject(CotizacionService);
  private notificacionService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  cotizacionForm!: FormGroup;
  materiales: any[] = [];
  solicitud?: Solicitud;
  isLoading = false;
  cotizacionCreada = false;
  cotizacionResultado?: any;
  private materialesPorTrabajo: any[] = [];
  preciosUnitariosPersonalizados: { [key: number]: number } = {};
  private readonly COSTO_BASE_POR_M2 = 0;
  materialesDisponibles: any[] = [];


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
    this.cargarMateriales();
    this.configurarFechasAutomaticas();
  }

  private loadSolicitud(id: number): void {
    this.solicitudService.getSolicitudDetalle(id).subscribe({
      next: (data: Solicitud) => {
        this.solicitud = data;
        console.log('Solicitud cargada:', this.solicitud);
        this.inicializarMaterialesPorTrabajo();
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

  private cargarMateriales(): void {
    this.materialService.getSimpleMateriales().subscribe({
      next: (materiales: any[]) => {
        this.materiales = materiales;
        this.actualizarMaterialesDisponibles(); // Actualizar disponibles inicialmente
        console.log('Materiales cargados:', this.materiales);
      },
      error: (err) => {
        console.error('Error al cargar materiales', err);
        this.notificacionService.error('Error al cargar los materiales');
      }
    });
  }

  private actualizarMaterialesDisponibles(): void {
    // Obtener todos los IDs de materiales ya seleccionados
    const materialesSeleccionados = new Set<number>();

    // Recorrer todos los trabajos y sus materiales
    this.materialesPorTrabajo.forEach(trabajoMateriales => {
      trabajoMateriales?.forEach((material: any) => {
        if (material.id_material) {
          materialesSeleccionados.add(Number(material.id_material));
        }
      });
    });

    // Filtrar materiales que NO están seleccionados
    this.materialesDisponibles = this.materiales.filter(material =>
      !materialesSeleccionados.has(material.idMaterial)
    );
  }

  private configurarFechasAutomaticas(): void {
    const hoy = new Date();
    const caducidad = new Date();
    caducidad.setDate(hoy.getDate() + 15);

    this.cotizacionForm.patchValue({
      fecha_emision: hoy.toISOString().split('T')[0],
      fecha_caducado: caducidad.toISOString().split('T')[0]
    });
  }

  private inicializarMaterialesPorTrabajo(): void {
    if (this.solicitud?.trabajos) {
      this.solicitud.trabajos.forEach((trabajo: TrabajoSolicitud, index: number) => {
        this.materialesPorTrabajo[index] = [];
      });
    }
  }

  getMaterialesDelTrabajo(index: number): any[] {
    return this.materialesPorTrabajo[index];
  }

  agregarMaterialATrabajo(trabajoIndex: number): void {
    if (!this.materialesPorTrabajo[trabajoIndex]) {
      this.materialesPorTrabajo[trabajoIndex] = [];
    }

    this.materialesPorTrabajo[trabajoIndex].push({
      id_material: '',
      cantidad: 1
    });
    this.actualizarMaterialesDisponibles();
  }

  removerMaterialDeTrabajo(trabajoIndex: number, materialIndex: number): void {
    if (this.materialesPorTrabajo[trabajoIndex]?.length > 1) {
      this.materialesPorTrabajo[trabajoIndex].splice(materialIndex, 1);
      // Actualizar materiales disponibles después de remover
      this.actualizarMaterialesDisponibles();
    }
  }

  getCostoTotal(): number {
    if (!this.solicitud?.trabajos) return 0;

    return this.solicitud.trabajos.reduce((total: number, trabajo: TrabajoSolicitud, index: number) => {
      return total + this.getSubtotalTrabajo(index);
    }, 0);
  }

  getTotalMateriales(): number {
    let total = 0;
    Object.values(this.materialesPorTrabajo).forEach(materiales => {
      total += materiales?.length || 0;
    });
    return total;
  }


  getPrecioMaterial(idMaterial: string | number): number {
    if (!idMaterial) return 0;
    const material = this.materiales.find(m => m.id_material === Number(idMaterial));
    return material?.precio || 0;
  }

  calcularSubtotalMaterial(material: any): number {
    if (!material?.id_material || !material?.cantidad) return 0;
    const precio = this.getPrecioMaterial(material.id_material);
    return precio * material.cantidad;
  }

  onMaterialChange(trabajoIndex: number, materialIndex: number): void {
    // Actualizar materiales disponibles cuando se selecciona uno nuevo
    this.actualizarMaterialesDisponibles();
  }

  onCantidadMaterialChange(trabajoIndex: number, materialIndex: number): void {

  }

  getMaterialesDisponiblesParaTrabajo(trabajoIndex: number, materialIndex: number): any[] {
    const materialActual = this.materialesPorTrabajo[trabajoIndex]?.[materialIndex];
    const idMaterialActual = materialActual?.id_material;

    if (!idMaterialActual) {
      // Si no hay material seleccionado, mostrar todos los disponibles
      return this.materialesDisponibles;
    }

    // Si hay material seleccionado, incluir ese material también
    const materialActualObj = this.materiales.find(m => m.idMaterial === Number(idMaterialActual));

    return [
      ...(materialActualObj ? [materialActualObj] : []),
      ...this.materialesDisponibles.filter(m => m.idMaterial !== Number(idMaterialActual))
    ];
  }

  onSubmit(): void {
    if (this.isLoading) return;

    if (this.cotizacionForm.valid) {
      this.isLoading = true;

      const formValue = this.cotizacionForm.getRawValue();
      const codCotizacion = 'COT-' + Date.now().toString().slice(-6);

      const cotizacionData = {
        codCotizacion: codCotizacion,
        idSolicitud: this.solicitud?.idSolicitud,
        trabajos: this.solicitud?.trabajos.map((trabajo: any, index: number) => ({
          idSolicitudTrabajo: trabajo.idSolicitudTrabajo,
          cantidad: trabajo.cantidad,
          costoUnitario: this.getCostoUnitarioTrabajo(index),
          subtotal: this.getSubtotalTrabajo(index),
          materiales: this.getMaterialesDelTrabajo(index).map((material: any) => ({
            idMaterial: Number(material.id_material)
          }))
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

  getCostoUnitarioTrabajo(index: number): number {
    const valor = this.preciosUnitariosPersonalizados[index];
    const costo = valor !== undefined ? Number(valor) : this.COSTO_BASE_POR_M2;
    return isNaN(costo) ? 0 : costo;
  }


  actualizarPrecioUnitario(index: number, nuevoPrecio: number) {
    this.preciosUnitariosPersonalizados[index] = nuevoPrecio;
  }

  getSubtotalTrabajo(index: number): number {
    const trabajo = this.solicitud?.trabajos?.[index];
    if (!trabajo) return 0;

    const subtotalMateriales = this.getMaterialesDelTrabajo(index).reduce((total, material) => {
      return total + this.calcularSubtotalMaterial(material);
    }, 0);

    const subtotalTrabajo = (trabajo.cantidad || 0) * this.getCostoUnitarioTrabajo(index);

    return subtotalTrabajo + subtotalMateriales;
  }

  cancelar() {
    this.router.navigate(['/home/list-cotizaciones']);
  }

}
