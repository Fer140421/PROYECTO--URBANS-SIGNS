import { Component, inject } from '@angular/core';
import { TrabajosService } from '../../../../../core/services/trabajos/trabajos.service';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteBusquedaDTO } from '../../../../../core/models/Clientes/busqueda.model';
import { CotizacionService, Material } from '../../../../../core/services/cotizacion/cotizacion.service';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../../../core/services/solicitud/solicitud.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-solicitud-cotizacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './solicitud-cotizacion.component.html',
  styleUrl: './solicitud-cotizacion.component.css'
})
export class SolicitudCotizacionComponent {
  trabajoService = inject(TrabajosService);
  clienteService = inject(ClientesService);
  solicitud = inject(SolicitudService);
  cotizacionService = inject(CotizacionService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  cotizacionForm!: FormGroup;
  currentStep = 0;
  totalSteps = 3;
  modoCliente: 'buscar' | 'registrar' = 'buscar';
  tipoCliente: 'Persona' | 'Empresa' = 'Persona';
  terminoBusqueda = false;
  clientes: any[] = [];
  clientesFiltrados: ClienteBusquedaDTO[] = [];
  listTrabajos: any[] = [];
  clienteSeleccionado: any | null = null;
  trabajosDisponibles: any[] = [];

  query: string = '';

  // Nuevos clientes
  nuevoCliente: any = {
    tipo_cliente: 'normal',
    email: ''
  };
  nuevaPersona: any = {
    nombre: '',
    ap: '',
    am: '',
    ci: '',
    celular: '',
    direccion: ''
  };
  nuevaEmpresa: any = {
    razon_social: '',
    nit: '',
    direccion: '',
    telefono: ''
  };

  // Materiales y detalles
  materiales: Material[] = [];
  isLoading = false;
  cotizacionResultado?: any;
  mostrarErrores = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.notificationService.error('Formato de imagen no permitido. Use JPG, PNG, WEBP o GIF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.error('La imagen no debe superar los 5 MB.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  constructor(
    private fb: FormBuilder,
  ) {
    this.cotizacionForm = this.createForm();
  }

  ngOnInit(): void {
    this.autoSeleccionarFechas();
    this.loadTrabajos();
  }

  loadTrabajos() {
    this.trabajoService.listarSimple().subscribe(trabajos => {
      this.listTrabajos = trabajos;
      console.log('Trabajos cargados:', this.listTrabajos);
      this.actualizarTrabajosDisponibles();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id_cliente: ['', Validators.required],
      fecha_emision: ['', Validators.required],
      observaciones: ['', Validators.required],
      trabajos: this.fb.array([this.crearTrabajoFormGroup()])
    });
  }

  get trabajos(): FormArray {
    return this.cotizacionForm.get('trabajos') as FormArray;
  }

  crearTrabajoFormGroup(): FormGroup {
    return this.fb.group({
      id_trabajo: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      dpis: [0, [Validators.min(0)]],
      base: [0, [Validators.required, Validators.min(0.1)]],
      altura: [0, [Validators.required, Validators.min(0.1)]],
      area_total: [{ value: 0, disabled: true }],
      descripcion: ['', Validators.required]
    });
  }

  getMaterialesDelTrabajo(trabajoIndex: number): FormArray {
    return this.trabajos.at(trabajoIndex).get('materiales') as FormArray;
  }

  removerMaterialDeTrabajo(trabajoIndex: number, materialIndex: number): void {
    const materiales = this.getMaterialesDelTrabajo(trabajoIndex);
    if (materiales.length > 1) {
      materiales.removeAt(materialIndex);
    }
  }

  autoSeleccionarFechas(): void {
    const hoy = new Date();

    // Fecha local sin UTC
    const fechaLocal = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const caducidad = new Date(fechaLocal);
    caducidad.setDate(caducidad.getDate() + 30);

    const formato = (fecha: Date) =>
      fecha.toLocaleDateString('en-CA'); 

    this.cotizacionForm.patchValue({
      fecha_emision: formato(fechaLocal),
      fecha_caducado: formato(caducidad)
    });
  }

  get detalles(): FormArray {
    return this.cotizacionForm.get('detalles') as FormArray;
  }

  nextStep(): void {
    if (this.validarPasoActual()) {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
      }
    } else {
      this.mostrarErrores = true;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.mostrarErrores = false;
    }
  }

  onBuscar() {
    const q = this.query.trim();

    // Si el buscador está vacío
    if (q.length === 0) {
      this.clientesFiltrados = [];
      this.terminoBusqueda = false; // No mostrar "sin resultados"
      return;
    }

    this.terminoBusqueda = true;

    this.clienteService.buscarClientes(q).subscribe({
      next: (data) => {
        this.clientesFiltrados = data;

        // Si no hay resultados, mostrar el mensaje
        if (data.length === 0) {
          console.log('Sin resultados');
        }
      },
      error: (err) => console.error('Error en búsqueda', err)
    });
  }


  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.cotizacionForm.patchValue({
      id_cliente: cliente.idCliente
    });
    this.mostrarErrores = false;
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
    this.cotizacionForm.patchValue({
      id_cliente: ''
    });
  }

  validarFormularioCliente(): boolean {
    if (this.tipoCliente === 'Persona') {
      return !!this.nuevaPersona.nombre &&
        !!this.nuevaPersona.ap &&
        !!this.nuevaPersona.ci &&
        !!this.nuevaPersona.celular;
    } else {
      return !!this.nuevaEmpresa.razon_social &&
        !!this.nuevaEmpresa.nit &&
        !!this.nuevaEmpresa.telefono;
    }
  }

  registrarCliente(): void {
    if (!this.validarFormularioCliente()) {
      this.mostrarErrores = true;
      return;
    }
    const nuevoCliente: any = {
      id_cliente: Math.max(0, ...this.clientes.map(c => c.id_cliente)) + 1,
      nombre: this.tipoCliente === 'Persona'
        ? `${this.nuevaPersona.nombre} ${this.nuevaPersona.ap} ${this.nuevaPersona.am}`
        : this.nuevaEmpresa.razon_social,
      email: this.nuevoCliente.email,
      telefono: this.tipoCliente === 'Persona' ? this.nuevaPersona.celular : this.nuevaEmpresa.telefono,
      tipo: this.tipoCliente,
      tipo_cliente: this.nuevoCliente.tipo_cliente
    };

    this.clientes.push(nuevoCliente);
    this.seleccionarCliente(nuevoCliente);

    this.nuevaPersona = { nombre: '', ap: '', am: '', ci: '', celular: '', direccion: '' };
    this.nuevaEmpresa = { razon_social: '', nit: '', direccion: '', telefono: '' };
    this.nuevoCliente.email = '';

    this.mostrarErrores = false;
  }

  removerDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }


  calcularSubtotal(index: number): void {
    const detalle = this.detalles.at(index);
    const base = detalle.get('base')?.value || 0;
    const altura = detalle.get('altura')?.value || 0;
    const precio = detalle.get('precio_unitario')?.value || 0;

    const subtotal = base * altura * precio;
    detalle.patchValue({ subtotal: subtotal });
  }

  getNombreMaterial(idMaterial: number): string {
    const material = this.materiales.find(m => m.id_material === idMaterial);
    return material ? material.nombre : 'Material no encontrado';
  }

  getNombreCliente(idCliente: number): string {
    if (this.clienteSeleccionado && this.clienteSeleccionado.idCliente === idCliente) {
      return this.clienteSeleccionado.displayName;
    }
    const cliente = this.clientes.find(c => c.idCliente === idCliente);
    return cliente ? cliente.displayName : 'Cliente no encontrado';
  }

  marcarControlesComoSucios(): void {
    Object.keys(this.cotizacionForm.controls).forEach(key => {
      const control = this.cotizacionForm.get(key);
      control?.markAsTouched();
    });
    this.mostrarErrores = true;
  }

  onMaterialChange(trabajoIndex: number, materialIndex: number): void {
    const material = this.getMaterialesDelTrabajo(trabajoIndex).at(materialIndex);
    const idMaterial = material.get('id_material')?.value;
    const materialData = this.materiales.find(m => m.id_material === parseInt(idMaterial));

    if (materialData) {
      material.patchValue({
        precio_unitario: materialData.precio_unitario
      });
      this.calcularSubtotalMaterial(trabajoIndex, materialIndex);
    }
  }

  calcularSubtotalMaterial(trabajoIndex: number, materialIndex: number): void {
    const material = this.getMaterialesDelTrabajo(trabajoIndex).at(materialIndex);
    const ancho = material.get('ancho')?.value || 0;
    const alto = material.get('alto')?.value || 0;
    const precio = material.get('precio_unitario')?.value || 0;

    const subtotal = ancho * alto * precio;
    material.patchValue({ subtotal: subtotal });
    this.calcularSubtotalTrabajo(trabajoIndex);
  }

  calcularAreaMaterial(trabajoIndex: number, materialIndex: number): number {
    const material = this.getMaterialesDelTrabajo(trabajoIndex).at(materialIndex);
    const ancho = material.get('ancho')?.value || 0;
    const alto = material.get('alto')?.value || 0;
    return ancho * alto;
  }

  onDimensionesChange(trabajoIndex: number): void {
    const trabajo = this.trabajos.at(trabajoIndex);
    const base = trabajo.get('base')?.value || 0;
    const altura = trabajo.get('altura')?.value || 0;

    const areaTotal = base * altura;
    trabajo.patchValue({ area_total: areaTotal });

    this.calcularSubtotalTrabajo(trabajoIndex);
  }

  validarPasoActual(): boolean {
    switch (this.currentStep) {
      case 0: // Paso Cliente
        return this.clienteSeleccionado !== null;

      case 1: // Paso Detalles
        return this.trabajos.length > 0 &&
          this.trabajos.controls.every(trabajo => {
            return trabajo.get('id_trabajo')?.valid &&
              trabajo.get('base')?.valid &&
              trabajo.get('altura')?.valid &&
              trabajo.get('cantidad')?.valid;
          });
      case 2:
        return this.cotizacionForm.valid;
      default:
        return false;
    }
  }

  onCantidadChange(trabajoIndex: number): void {
    this.calcularSubtotalTrabajo(trabajoIndex);
  }


  onSubmit(): void {
    if (this.isLoading) return;

    if (this.clienteSeleccionado) {
      this.isLoading = true;
      const formValue = this.cotizacionForm.getRawValue();
      const codCotizacion = 'COT-' + Date.now().toString().slice(-6);
      const cotizacionData = {
        codSolicitud: codCotizacion,
        idCliente: formValue.id_cliente,
        estado: 'Pendiente',
        observaciones: formValue.observaciones,
        trabajos: formValue.trabajos.map((trabajo: any) => ({
          idTrabajo: Number(trabajo.id_trabajo),
          cantidad: trabajo.cantidad,
          base: trabajo.base,
          altura: trabajo.altura,
          descripcion: trabajo.descripcion
        }))
      };
      console.log(cotizacionData)
      this.solicitud.registrarSolicitud(cotizacionData, this.selectedFile).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (result) => {
          this.cotizacionResultado = result;
          this.isLoading = false;
          this.notificationService.success('Solicitud registrada con éxito.');
          this.router.navigate(['/home/list-solicitudes']);

        },
        error: (error) => {
          this.notificationService.error('Error al registrar la solicitud. Por favor, inténtelo de nuevo.');
          this.isLoading = false;
        }
      });
    } else {
      this.marcarControlesComoSucios();
    }
  }

  calcularSubtotalTrabajo(trabajoIndex: number): void {
    const trabajo = this.trabajos.at(trabajoIndex);
    const areaTotal = trabajo.get('area_total')?.value || 0;
    const costoUnitario = trabajo.get('costo_unitario')?.value || 0;
    const cantidad = trabajo.get('cantidad')?.value || 1;

    const subtotal = areaTotal * costoUnitario * cantidad;
    trabajo.patchValue({ subtotal: subtotal });
  }

  getTotalMateriales(): number {
    return this.trabajos.controls.reduce((total, trabajo, index) => {
      return total + this.getMaterialesDelTrabajo(index).length;
    }, 0);
  }

  getTrabajoSeleccionado(trabajoIndex: number): any {
    const idTrabajo = this.trabajos.at(trabajoIndex).get('id_trabajo')?.value;
    return this.listTrabajos.find(t => t.id === parseInt(idTrabajo));
  }

  getNombreTrabajo(idTrabajo: number): string {
    const trabajo = this.listTrabajos.find(t => t.idTrabajo === idTrabajo);
    return trabajo ? trabajo.nombre : 'Trabajo no encontrado';
  }

  getTotalMaterialesConfirmacion(): number {
    if (!this.cotizacionForm.value.trabajos) return 0;

    return this.cotizacionForm.value.trabajos.reduce((total: number, trabajo: any) => {
      return total + (trabajo.materiales?.length || 0);
    }, 0);
  }

  generarCodigoTemporal(): string {
    return Date.now().toString().slice(-6);
  }

  cancelar() {
    this.router.navigate(['/home/list-cotizacion']);
  }

  private actualizarTrabajosDisponibles(): void {
    // Obtener todos los IDs de trabajos ya seleccionados
    const trabajosSeleccionados = new Set<number>();

    // Recorrer todos los trabajos del formulario
    this.trabajos.controls.forEach((trabajoControl: any) => {
      const idTrabajo = trabajoControl.get('id_trabajo')?.value;
      if (idTrabajo) {
        trabajosSeleccionados.add(Number(idTrabajo));
      }
    });

    // Filtrar trabajos que NO están seleccionados
    this.trabajosDisponibles = this.listTrabajos.filter(trabajo =>
      !trabajosSeleccionados.has(trabajo.id)
    );
  }

  agregarTrabajo(): void {
    this.trabajos.push(this.crearTrabajoFormGroup());
    // Actualizar trabajos disponibles después de agregar
    this.actualizarTrabajosDisponibles();
  }

  /**
   * 🔥 ACTUALIZAR: Cuando se remueve un trabajo
   */
  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.removeAt(index);
      // Actualizar trabajos disponibles después de remover
      this.actualizarTrabajosDisponibles();
    }
  }

  onTrabajoChange(trabajoIndex: number): void {
    const trabajo = this.trabajos.at(trabajoIndex);
    const idTrabajo = trabajo.get('id_trabajo')?.value;
    const trabajoData = this.listTrabajos.find(t => t.id === parseInt(idTrabajo));

    if (trabajoData && trabajoData.costo_unitario) {
      trabajo.patchValue({
        costo_unitario: trabajoData.costo_unitario
      });
      this.calcularSubtotalTrabajo(trabajoIndex);
    }

    // Actualizar trabajos disponibles cuando se selecciona uno nuevo
    this.actualizarTrabajosDisponibles();
  }

  /**
   * 🔥 NUEVO: Obtener trabajos disponibles para un trabajo específico
   * Incluye el trabajo actualmente seleccionado en esa posición
   */
  getTrabajosDisponiblesParaTrabajo(trabajoIndex: number): any[] {
    const trabajoActual = this.trabajos.at(trabajoIndex);
    const idTrabajoActual = trabajoActual?.get('id_trabajo')?.value;

    // Obtener IDs de trabajos seleccionados en OTROS selectores
    const trabajosSeleccionados = new Set<number>();
    this.trabajos.controls.forEach((trabajoControl: any, index: number) => {
      if (index !== trabajoIndex) { // Excluir el selector actual
        const idTrabajo = trabajoControl.get('id_trabajo')?.value;
        if (idTrabajo) {
          trabajosSeleccionados.add(Number(idTrabajo));
        }
      }
    });

    // Retornar solo trabajos que NO están seleccionados en otros lugares
    return this.listTrabajos.filter(trabajo =>
      !trabajosSeleccionados.has(trabajo.id)
    );
  }

  /**
   * 🔥 NUEVO: Verificar si un trabajo está siendo usado en otro lugar
   */
  estaTrabajoEnUso(idTrabajo: number, trabajoActualIndex: number): boolean {
    for (let i = 0; i < this.trabajos.length; i++) {
      if (i === trabajoActualIndex) continue; // Saltar el trabajo actual

      const trabajo = this.trabajos.at(i);
      const idTrabajoOtro = trabajo?.get('id_trabajo')?.value;

      if (idTrabajoOtro && Number(idTrabajoOtro) === idTrabajo) {
        return true;
      }
    }
    return false;
  }

  /**
   * 🔥 ACTUALIZAR: Resetear formulario
   */
  resetForm(): void {
    this.cotizacionForm.reset();
    this.trabajos.clear();
    this.trabajos.push(this.crearTrabajoFormGroup());

    this.currentStep = 0;
    this.clienteSeleccionado = null;
    this.modoCliente = 'buscar';
    this.tipoCliente = 'Persona';
    this.terminoBusqueda = false;
    this.mostrarErrores = false;

    // Resetear nuevos clientes
    this.nuevoCliente = { tipo_cliente: 'normal', email: '' };
    this.nuevaPersona = { nombre: '', ap: '', am: '', ci: '', celular: '', direccion: '' };
    this.nuevaEmpresa = { razon_social: '', nit: '', direccion: '', telefono: '' };
    this.selectedFile = null;
    this.imagePreview = null;

    this.autoSeleccionarFechas();

    // Actualizar trabajos disponibles
    this.actualizarTrabajosDisponibles();
  }


}
