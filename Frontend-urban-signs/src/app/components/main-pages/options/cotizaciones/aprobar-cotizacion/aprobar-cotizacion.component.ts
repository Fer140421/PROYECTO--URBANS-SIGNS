import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmarCotizacionService } from '../../../../../core/services/confirmar-cotizacion/confirmar-cotizacion.service';
import { MaterialProduccionService } from '../../../../../core/services/material-produccion/material-produccion.service';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';
interface ConfirmacionPedido {
  cliente: ClienteInfo;
  cotizacion: CotizacionInfo;
  trabajos: TrabajoCotizado[];
}

interface ClienteInfo {
  nombre: string;
  tipoCliente: string;
  tipoClientePersonaEmpresa: string;
  correo: string;
}

interface CotizacionInfo {
  idCotizacion: number;
  codigo: string;
  fechaEmision: string;
  fechaCaducidad: string;
  costoTotal: number;
}

interface TrabajoCotizado {
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

interface Responsable {
  id: number;
  nombre: string;
  cargo: string;
}
@Component({
  selector: 'app-aprobar-cotizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './aprobar-cotizacion.component.html',
  styleUrl: './aprobar-cotizacion.component.css'
})
export class AprobarCotizacionComponent {
  private cotizacionService = inject(CotizacionService);
  private pedidosService = inject(PedidosService);
  private notificacionService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  confirmacionPedido?: ConfirmacionPedido;
  responsables: Responsable[] = [];
  isLoading = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  archivoSeleccionado: File | null = null;
  pagoForm!: FormGroup;
  produccionForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarDatosIniciales();
  }

  private inicializarFormularios(): void {
    // Formulario de Pago con validaciones
    this.pagoForm = this.fb.group({
      metodo_pago: ['', [Validators.required]],
      monto_adelanto: [0, [
        Validators.required,
        Validators.min(0),
        this.validarMontoAdelanto.bind(this)
      ]],
      fecha_pago: ['', [
        Validators.required,
        this.validarFechaPago.bind(this)
      ]],
      comprobante: ['']
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    const fechaLocal = hoy.toLocaleDateString('en-CA');

    this.pagoForm.patchValue({
      fecha_pago: fechaLocal
    });

    this.produccionForm = this.fb.group({
      fecha_inicio: ['', [
        Validators.required,
        this.validarFechaInicio.bind(this)
      ]],
      fecha_entrega: ['', [
        Validators.required
      ]],
      responsable_produccion: [''],
      prioridad: ['MEDIA'],
      observaciones: ['', [Validators.maxLength(500)]]
    }, {
      validators: [this.validarRangoFechas.bind(this)]
    });

    this.pagoForm.get('monto_adelanto')?.valueChanges.subscribe(() => {
      this.pagoForm.get('monto_adelanto')?.updateValueAndValidity({ emitEvent: false });
    });

    this.produccionForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
      this.produccionForm.get('fecha_entrega')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private validarMontoAdelanto(control: AbstractControl): ValidationErrors | null {
    if (!this.confirmacionPedido?.cotizacion.costoTotal) {
      return null;
    }

    const monto = Number(control.value);
    const total = this.confirmacionPedido.cotizacion.costoTotal;
    const minimo = total * 0.3;

    if (monto < minimo) {
      return {
        montoMinimo: {
          actual: monto,
          minimo: minimo,
          mensaje: `El adelanto mínimo es Bs.${minimo.toFixed(2)} (30% del total)`
        }
      };
    }

    if (monto > total) {
      return {
        montoMaximo: {
          actual: monto,
          maximo: total,
          mensaje: `El adelanto no puede superar el total de Bs.${total.toFixed(2)}`
        }
      };
    }

    return null;
  }

  /**
   * Valida que la fecha de pago no sea futura (máximo hoy)
   */
  private validarFechaPago(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const fechaPago = new Date(control.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaPago > hoy) {
      return {
        fechaFutura: {
          mensaje: 'La fecha de pago no puede ser futura'
        }
      };
    }

    // Validar que no sea muy antigua (más de 30 días atrás)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    hace30Dias.setHours(0, 0, 0, 0);

    if (fechaPago < hace30Dias) {
      return {
        fechaMuyAntigua: {
          mensaje: 'La fecha de pago no puede ser anterior a 30 días'
        }
      };
    }

    return null;
  }

  /**
   * Valida que la fecha de inicio no sea anterior a hoy
   */
  private validarFechaInicio(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const fechaInicio = new Date(control.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      return {
        fechaPasada: {
          mensaje: 'La fecha de inicio no puede ser anterior a hoy'
        }
      };
    }

    // Validar que no sea muy lejana (más de 60 días)
    const maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 60);

    if (fechaInicio > maxFecha) {
      return {
        fechaMuyLejana: {
          mensaje: 'La fecha de inicio no puede ser posterior a 60 días'
        }
      };
    }

    return null;
  }

  /**
   * Valida que la fecha de entrega sea posterior a la fecha de inicio
   * y que haya un mínimo de días laborables
   */
  private validarRangoFechas(group: AbstractControl): ValidationErrors | null {
    const fechaInicio = group.get('fecha_inicio')?.value;
    const fechaEntrega = group.get('fecha_entrega')?.value;

    if (!fechaInicio || !fechaEntrega) return null;

    const inicio = new Date(fechaInicio + 'T00:00:00');
    const entrega = new Date(fechaEntrega + 'T00:00:00');

    // Validar que entrega sea posterior a inicio
    if (entrega <= inicio) {
      return {
        fechaEntregaInvalida: {
          mensaje: 'La fecha de entrega debe ser posterior a la fecha de inicio'
        }
      };
    }

    // Calcular días de diferencia
    const diffTime = entrega.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Mínimo 3 días de producción
    if (diffDays < 3) {
      return {
        diasInsuficientes: {
          mensaje: 'Debe haber al menos 3 días entre inicio y entrega'
        }
      };
    }

    // Máximo 90 días de producción
    if (diffDays > 90) {
      return {
        diasExcesivos: {
          mensaje: 'El tiempo de producción no puede exceder 90 días'
        }
      };
    }

    return null;
  }

  // ============ MÉTODOS AUXILIARES PARA MOSTRAR ERRORES ============

  obtenerErrorCampo(form: FormGroup, campo: string): string {
    const control = form.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    // Errores estándar
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;

    // Errores personalizados
    if (errors['montoMinimo']) return errors['montoMinimo'].mensaje;
    if (errors['montoMaximo']) return errors['montoMaximo'].mensaje;
    if (errors['fechaFutura']) return errors['fechaFutura'].mensaje;
    if (errors['fechaMuyAntigua']) return errors['fechaMuyAntigua'].mensaje;
    if (errors['fechaPasada']) return errors['fechaPasada'].mensaje;
    if (errors['fechaMuyLejana']) return errors['fechaMuyLejana'].mensaje;

    return '';
  }

  obtenerErrorFormulario(form: FormGroup): string {
    if (!form.errors || !form.touched) return '';

    const errors = form.errors;

    if (errors['fechaEntregaInvalida']) return errors['fechaEntregaInvalida'].mensaje;
    if (errors['diasInsuficientes']) return errors['diasInsuficientes'].mensaje;
    if (errors['diasExcesivos']) return errors['diasExcesivos'].mensaje;

    return '';
  }

  campoEsInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  // ============ MÉTODOS ORIGINALES ============

  private cargarDatosIniciales(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCotizacion(id);
    }
    this.configurarFechasPredeterminadas();
  }

  private loadCotizacion(id: number): void {
    this.isLoading = true;
    this.cotizacionService.obtenerConfirmacionPedido(id).subscribe({
      next: (data: any) => {
        this.confirmacionPedido = data;
        console.log('Confirmación cargada:', this.confirmacionPedido);
        this.configurarMontoAdelanto();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la cotización', err);
        this.mostrarError('Error al cargar la cotización');
        this.isLoading = false;
      }
    });
  }

  private configurarFechasPredeterminadas(): void {
    const hoy = new Date();
    const entrega = new Date();
    entrega.setDate(hoy.getDate() + 10);
    this.produccionForm.patchValue({
      fecha_inicio: hoy.toISOString().split('T')[0],
      fecha_entrega: entrega.toISOString().split('T')[0]
    });
    this.pagoForm.patchValue({
      fecha_pago: hoy.toISOString().split('T')[0]
    });
  }

  private configurarMontoAdelanto(): void {
    const minimo = this.calcularMinimoAdelanto();
    this.pagoForm.patchValue({
      monto_adelanto: minimo
    });
  }

  calcularMinimoAdelanto(): number {
    if (!this.confirmacionPedido?.cotizacion.costoTotal) return 0;
    return this.confirmacionPedido.cotizacion.costoTotal * 0.3;
  }

  calcularPorcentajeAdelanto(): number {
    const monto = this.pagoForm.get('monto_adelanto')?.value || 0;
    const total = this.confirmacionPedido?.cotizacion.costoTotal || 1;
    return Math.round((monto / total) * 100);
  }

  calcularSaldoPendiente(): number {
    const total = this.confirmacionPedido?.cotizacion.costoTotal || 0;
    const adelanto = this.pagoForm.get('monto_adelanto')?.value || 0;
    return total - adelanto;
  }

  formulariosValidos(): boolean {
    // Marcar todos los campos como touched para mostrar errores
    this.marcarControlesComoSucios();

    const pagoValido = this.pagoForm.valid;
    const produccionValido = this.produccionForm.valid;

    if (!pagoValido) {
      console.log('Errores en Pago:', this.pagoForm.errors);
      Object.keys(this.pagoForm.controls).forEach(key => {
        const control = this.pagoForm.get(key);
        if (control?.invalid) {
          console.log(`${key}:`, control.errors);
        }
      });
    }

    if (!produccionValido) {
      console.log('Errores en Producción:', this.produccionForm.errors);
      Object.keys(this.produccionForm.controls).forEach(key => {
        const control = this.produccionForm.get(key);
        if (control?.invalid) {
          console.log(`${key}:`, control.errors);
        }
      });
    }

    return pagoValido && produccionValido;
  }

  getEstadoTexto(): string {
    const porcentaje = this.calcularPorcentajeAdelanto();
    if (porcentaje >= 50) return 'APROBADO';
    if (porcentaje >= 30) return 'PENDIENTE';
    return 'INSUFICIENTE';
  }

  getEstadoColor(): string {
    const estado = this.getEstadoTexto();
    switch (estado) {
      case 'APROBADO': return 'text-green-600';
      case 'PENDIENTE': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarError('El archivo no puede ser mayor a 5MB');
        return;
      }

      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!tiposPermitidos.includes(file.type)) {
        this.mostrarError('Solo se permiten archivos PDF, JPG y PNG');
        return;
      }

      this.archivoSeleccionado = file;
    }
  }

  confirmarYEnviarProduccion(): void {
    if (this.isLoading) return;

    if (!this.formulariosValidos()) {
      this.mostrarError('Por favor corrija los errores en el formulario antes de continuar');
      return;
    }

    this.isLoading = true;
    this.limpiarMensajes();

    const pedidoRequest: any = {
      idCotizacion: this.confirmacionPedido?.cotizacion.idCotizacion!,
      anticipo: Number(this.pagoForm.get('monto_adelanto')?.value),
      metodoPago: this.pagoForm.get('metodo_pago')?.value,
      observacion: this.produccionForm.get('observaciones')?.value || ''
    };

    console.log('Enviando pedido:', pedidoRequest);

    this.pedidosService.generarPedido(pedidoRequest).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.notificacionService.success('Se ha generado un pedido exitosamente');
        setTimeout(() => {
          this.router.navigate(['/home/list-pedidos']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al generar pedido:', error);
        this.notificacionService.error('Error al generar el pedido');
        this.isLoading = false;
      }
    });
  }

  imprimirCotizacion(): void {
    window.print();
  }

  cancelar(): void {
    this.router.navigate(['/home/list-cotizaciones']);
  }

  private marcarControlesComoSucios(): void {
    [this.pagoForm, this.produccionForm].forEach(form => {
      form.markAllAsTouched();
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
      });
    });
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 5000);
  }

  private mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 5000);
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
