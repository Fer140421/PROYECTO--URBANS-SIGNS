import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { ClienteBusquedaDTO } from '../../../../../core/models/Clientes/busqueda.model';

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
  private clienteService = inject(ClientesService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // Inputs
  @Input() mostrar: boolean = false;
  @Input() solicitud: any | null = null;

  // Outputs
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  // Estado interno
  guardando = false;
  mensajeError = '';
  listTrabajos: any[] = [];
  trabajosDisponibles: any[] = [];

  // Archivos e imágenes
  trabajoFiles: (File | null)[] = [];
  trabajoPreviews: (string | null)[] = [];
  imagenModalUrl: string | null = null;

  // Cliente
  clienteSeleccionado: any | null = null;
  clienteDetalle: any | null = null;
  modoCambiarCliente = false;
  queryCliente = '';
  clientesFiltrados: ClienteBusquedaDTO[] = [];
  buscandoCliente = false;
  busquedaRealizada = false;

  // Formulario
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
      this.modoCambiarCliente = false;
      this.queryCliente = '';
      this.clientesFiltrados = [];
      this.busquedaRealizada = false;
      this.imagenModalUrl = null;
      if (this.solicitud) {
        this.cargarDatosEnFormulario(this.solicitud);
      }
    }
  }

  private inicializarFormulario(): void {
    this.modificacionForm = this.fb.group({
      estado: ['PENDIENTE', Validators.required],
      observaciones: [''],
      trabajos: this.fb.array([])
    });
  }

  private cargarTrabajos(): void {
    this.trabajosService.listarSimple().subscribe({
      next: (trabajos) => {
        this.listTrabajos = trabajos;
        this.actualizarTrabajosDisponibles();
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

  crearTrabajoFormGroup(data?: any): FormGroup {
    const unidad = (data?.unidadMedida || data?.unidad_medida || 'm').toLowerCase();
    const base = Number(data?.base) || 0;
    const altura = Number(data?.altura) || 0;
    let areaTotal = Number(data?.areaTotal ?? data?.area_total);
    if (!areaTotal || isNaN(areaTotal)) {
      areaTotal = unidad === 'cm' ? (base * altura) / 10000 : base * altura;
      areaTotal = Number(areaTotal.toFixed(4));
    }

    return this.fb.group({
      id_trabajo: [data?.idTrabajo || data?.id_trabajo || '', Validators.required],
      cantidad: [data?.cantidad || 1, [Validators.required, Validators.min(1)]],
      unidad_medida: [unidad, Validators.required],
      base: [base, [Validators.required, Validators.min(0.01)]],
      altura: [altura, [Validators.required, Validators.min(0.01)]],
      area_total: [{ value: areaTotal, disabled: true }],
      descripcion: [data?.descripcion || ''],
      archivoReferencia: [data?.archivoReferencia || null]
    });
  }

  // ========== GESTIÓN DE CLIENTE ==========

  toggleCambiarCliente(): void {
    this.modoCambiarCliente = !this.modoCambiarCliente;
    this.queryCliente = '';
    this.clientesFiltrados = [];
    this.busquedaRealizada = false;
  }

  buscarClientes(): void {
    const q = this.queryCliente.trim();
    if (!q) {
      this.clientesFiltrados = [];
      this.busquedaRealizada = false;
      return;
    }
    this.buscandoCliente = true;
    this.busquedaRealizada = true;
    this.clienteService.buscarClientes(q).subscribe({
      next: (data) => {
        this.clientesFiltrados = data || [];
        this.buscandoCliente = false;
      },
      error: (err) => {
        console.error('Error al buscar clientes:', err);
        this.buscandoCliente = false;
      }
    });
  }

  seleccionarNuevoCliente(cliente: any): void {
    this.clienteSeleccionado = {
      idCliente: cliente.idCliente,
      displayName: cliente.displayName,
      tipo: cliente.tipo,
      tipoClientePersonaEmpresa: cliente.tipo,
      tipoCliente: cliente.tipo_cliente,
      nit: cliente.nit,
      ci: cliente.ci,
      telefono: cliente.telefono,
      email: cliente.email,
      correo: cliente.email,
      direccion: cliente.direccion
    };
    this.modoCambiarCliente = false;
    this.cargarDetalleCliente(cliente.idCliente);
  }

  private cargarDetalleCliente(idCliente: number): void {
    if (!idCliente) return;
    this.clienteService.obtenerClientePorId(idCliente).subscribe({
      next: (detalle) => {
        this.clienteDetalle = detalle;
      },
      error: (err) => {
        console.warn('No se pudo cargar el detalle completo del cliente:', err);
      }
    });
  }

  getNombreCliente(): string {
    if (this.clienteSeleccionado) {
      if (this.clienteSeleccionado.displayName) return this.clienteSeleccionado.displayName;
      if (this.clienteSeleccionado.tipoClientePersonaEmpresa === 'Empresa' || this.clienteSeleccionado.tipo === 'Empresa') {
        return this.clienteSeleccionado.empresa?.razonSocial || this.clienteSeleccionado.razonSocial || 'Empresa';
      }
      const p = this.clienteSeleccionado.persona;
      if (p) {
        return `${p.name_people || p.nombre || ''} ${p.ap || ''} ${p.am || ''}`.trim();
      }
    }
    return 'Cliente sin registrar';
  }

  getDocumentoCliente(): string {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return '—';
    return c.empresa?.nit || c.persona?.ci || c.nit || c.ci || '—';
  }

  getTelefonoCliente(): string {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return '—';
    return c.empresa?.telefono || c.persona?.phone_number || c.persona?.celular || c.telefono || '—';
  }

  getCorreoCliente(): string {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return '—';
    return c.correo || c.email || '—';
  }

  getDireccionCliente(): string {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return '—';
    return c.empresa?.direccion || c.persona?.address || c.persona?.direccion || c.direccion || '—';
  }

  getTipoClienteTexto(): string {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return 'Persona Natural';
    return c.tipoClientePersonaEmpresa || c.tipo || 'Persona Natural';
  }

  esClienteDestacado(): boolean {
    const c = this.clienteDetalle || this.clienteSeleccionado;
    if (!c) return false;
    return c.tipoCliente === 'destacado' || c.tipo_cliente === 'destacado';
  }

  // ========== MEDIDAS Y TRABAJOS ==========

  cambiarUnidadMedida(index: number, nuevaUnidad: 'm' | 'cm'): void {
    const trabajo = this.trabajos.at(index);
    if (!trabajo) return;
    const unidadActual = trabajo.get('unidad_medida')?.value || 'm';
    if (unidadActual === nuevaUnidad) return;

    trabajo.patchValue({ unidad_medida: nuevaUnidad });
    this.onDimensionesChange(index);
  }

  onDimensionesChange(index: number): void {
    const trabajo = this.trabajos.at(index);
    if (!trabajo) return;
    const base = Number(trabajo.get('base')?.value) || 0;
    const altura = Number(trabajo.get('altura')?.value) || 0;
    const unidad = trabajo.get('unidad_medida')?.value || 'm';

    let areaTotal = 0;
    if (unidad === 'cm') {
      areaTotal = (base * altura) / 10000;
    } else {
      areaTotal = base * altura;
    }

    areaTotal = Number(areaTotal.toFixed(4));
    trabajo.patchValue({ area_total: areaTotal });
  }

  onTrabajoChange(index: number): void {
    this.actualizarTrabajosDisponibles();
  }

  private actualizarTrabajosDisponibles(): void {
    const seleccionados = new Set<number>();
    this.trabajos.controls.forEach(ctrl => {
      const id = ctrl.get('id_trabajo')?.value;
      if (id) seleccionados.add(Number(id));
    });

    this.trabajosDisponibles = this.listTrabajos.filter(t => !seleccionados.has(t.id));
  }

  getTrabajosDisponiblesParaTrabajo(index: number): any[] {
    const seleccionadosEnOtros = new Set<number>();
    this.trabajos.controls.forEach((ctrl, i) => {
      if (i !== index) {
        const id = ctrl.get('id_trabajo')?.value;
        if (id) seleccionadosEnOtros.add(Number(id));
      }
    });

    return this.listTrabajos.filter(t => !seleccionadosEnOtros.has(t.id));
  }

  getNombreTrabajo(idTrabajo: any): string {
    if (!idTrabajo) return 'Seleccione un trabajo';
    const numId = Number(idTrabajo);
    const trabajo = this.listTrabajos.find(t => t.id === numId || t.idTrabajo === numId);
    return trabajo ? (trabajo.nombre || trabajo.nombreTrabajo) : `Trabajo #${idTrabajo}`;
  }

  agregarTrabajo(): void {
    this.trabajos.push(this.crearTrabajoFormGroup());
    this.trabajoFiles.push(null);
    this.trabajoPreviews.push(null);
    this.actualizarTrabajosDisponibles();
  }

  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.removeAt(index);
      this.trabajoFiles.splice(index, 1);
      this.trabajoPreviews.splice(index, 1);
      this.actualizarTrabajosDisponibles();
    }
  }

  // ========== FOTOS / IMÁGENES ==========

  onTrabajoFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.notificationService.error('Formato no permitido. Use JPG, PNG, WEBP o GIF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('La imagen no debe superar los 5 MB.');
        return;
      }
      this.trabajoFiles[index] = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.trabajoPreviews[index] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeTrabajoFile(index: number): void {
    this.trabajoFiles[index] = null;
    this.trabajoPreviews[index] = null;
    const trabajo = this.trabajos.at(index);
    if (trabajo) {
      trabajo.patchValue({ archivoReferencia: null });
    }
  }

  abrirModalImagen(url: string): void {
    this.imagenModalUrl = url;
  }

  cerrarModalImagen(): void {
    this.imagenModalUrl = null;
  }

  // ========== TOTALES Y RESÚMENES ==========

  calcularTotalUnidades(): number {
    return this.trabajos.controls.reduce((sum, ctrl) => sum + (Number(ctrl.get('cantidad')?.value) || 0), 0);
  }

  calcularAreaTotalGeneral(): number {
    return this.trabajos.controls.reduce((sum, ctrl) => {
      const area = Number(ctrl.get('area_total')?.value) || 0;
      const cant = Number(ctrl.get('cantidad')?.value) || 1;
      return sum + (area * cant);
    }, 0);
  }

  getTotalImagenesAdjuntas(): number {
    return this.trabajoPreviews.filter(p => !!p).length;
  }

  // ========== CARGA Y GUARDADO ==========

  private cargarDatosEnFormulario(solicitud: any): void {
    this.solicitud = solicitud;
    this.clienteSeleccionado = solicitud.cliente;
    this.clienteDetalle = null;

    if (solicitud.cliente?.idCliente) {
      this.cargarDetalleCliente(solicitud.cliente.idCliente);
    }

    this.modificacionForm.patchValue({
      estado: solicitud.estado || 'PENDIENTE',
      observaciones: solicitud.observaciones || ''
    });

    this.trabajos.clear();
    this.trabajoFiles = [];
    this.trabajoPreviews = [];

    if (solicitud.trabajos && solicitud.trabajos.length > 0) {
      solicitud.trabajos.forEach((trabajo: any) => {
        this.trabajos.push(this.crearTrabajoFormGroup(trabajo));
        this.trabajoFiles.push(null);
        this.trabajoPreviews.push(trabajo.archivoReferencia || null);
      });
    } else {
      this.trabajos.push(this.crearTrabajoFormGroup());
      this.trabajoFiles.push(null);
      this.trabajoPreviews.push(null);
    }

    this.actualizarTrabajosDisponibles();
  }

  onGuardar(): void {
    if (this.guardando) return;

    if (this.modificacionForm.invalid) {
      this.marcarControlesComoSucios();
      this.notificationService.error('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    const idClienteFinal = this.clienteSeleccionado?.idCliente ||
                           this.clienteSeleccionado?.id_cliente ||
                           this.solicitud?.cliente?.idCliente ||
                           this.solicitud?.cliente?.id_cliente;

    if (!idClienteFinal) {
      this.notificationService.error('Debe haber un cliente seleccionado');
      return;
    }

    const formVal = this.modificacionForm.getRawValue();

    const request = {
      codSolicitud: this.solicitud.codSolicitud,
      idCliente: idClienteFinal,
      observaciones: formVal.observaciones || '',
      archivoReferencia: this.solicitud.archivoReferencia || null,
      trabajos: formVal.trabajos.map((t: any, index: number) => ({
        idTrabajo: Number(t.id_trabajo),
        cantidad: Number(t.cantidad),
        base: Number(t.base),
        altura: Number(t.altura),
        unidadMedida: t.unidad_medida || 'm',
        descripcion: t.descripcion ? t.descripcion.trim() : '',
        archivoReferencia: this.trabajoFiles[index] ? null : (t.archivoReferencia || this.trabajoPreviews[index] || null)
      }))
    };

    this.guardando = true;
    this.mensajeError = '';

    this.solicitudService.modificarSolicitud(this.solicitud.idSolicitud, request, null, this.trabajoFiles).pipe(
      finalize(() => this.guardando = false)
    ).subscribe({
      next: (response) => {
        this.notificationService.success('Solicitud modificada exitosamente');
        this.guardado.emit(response);
        this.cerrar.emit();
      },
      error: (err) => {
        console.error('Error al modificar la solicitud:', err);
        const msg = err?.error?.message || err?.message || 'No se pudo modificar la solicitud';
        this.mensajeError = msg;
        this.notificationService.error(msg);
        this.error.emit(msg);
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
}
