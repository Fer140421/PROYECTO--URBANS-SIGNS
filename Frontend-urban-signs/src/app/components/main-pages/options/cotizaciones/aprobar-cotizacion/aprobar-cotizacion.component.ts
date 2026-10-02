import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CotizacionService } from '../../../../../core/services/cotizacion/cotizacion.service';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';

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

@Component({
  selector: 'app-aprobar-cotizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './aprobar-cotizacion.component.html',
  styleUrl: './aprobar-cotizacion.component.css'
})
export class AprobarCotizacionComponent implements OnInit {
  private cotizacionService = inject(CotizacionService);
  private pedidosService = inject(PedidosService);
  private notificacionService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  confirmacionPedido?: ConfirmacionPedido;
  isLoading = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  pagoForm!: FormGroup;

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosIniciales();
  }

  private formatFechaLocal(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private inicializarFormulario(): void {
    this.pagoForm = this.fb.group({
      metodo_pago: ['EFECTIVO', [Validators.required]],
      monto_adelanto: [0, [
        Validators.required,
        Validators.min(0),
        this.validarMontoAdelanto.bind(this)
      ]],
      fecha_pago: [this.formatFechaLocal()],
      observaciones: ['', [Validators.maxLength(500)]]
    });

    this.pagoForm.get('monto_adelanto')?.valueChanges.subscribe(() => {
      this.pagoForm.get('monto_adelanto')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private validarMontoAdelanto(control: AbstractControl): ValidationErrors | null {
    if (!this.confirmacionPedido?.cotizacion?.costoTotal) {
      return null;
    }

    const monto = Number(control.value) || 0;
    const total = this.confirmacionPedido.cotizacion.costoTotal;
    const minimo = Math.round(total * 0.3 * 100) / 100;

    if (monto < minimo) {
      return {
        montoMinimo: {
          actual: monto,
          minimo: minimo,
          mensaje: `El anticipo mínimo es Bs. ${minimo.toFixed(2)} (30% del total)`
        }
      };
    }

    if (monto > total) {
      return {
        montoMaximo: {
          actual: monto,
          maximo: total,
          mensaje: `El anticipo no puede exceder el total de Bs. ${total.toFixed(2)}`
        }
      };
    }

    return null;
  }

  private cargarDatosIniciales(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadCotizacion(id);
    } else {
      this.mostrarError('Identificador de cotización no válido');
    }
  }

  private loadCotizacion(id: number): void {
    this.isLoading = true;
    this.cotizacionService.obtenerConfirmacionPedido(id).subscribe({
      next: (data: any) => {
        this.confirmacionPedido = data;
        this.configurarMontoAdelanto();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la cotización', err);
        this.mostrarError('Error al cargar la información de la cotización');
        this.isLoading = false;
      }
    });
  }

  private configurarMontoAdelanto(): void {
    const defaultMonto = this.calcularMontoPorcentaje(50); // Sugerir 50% por defecto
    this.pagoForm.patchValue({
      monto_adelanto: defaultMonto
    });
  }

  seleccionarMetodoPago(metodo: string): void {
    this.pagoForm.patchValue({ metodo_pago: metodo });
  }

  seleccionarPorcentajeAdelanto(porcentaje: number): void {
    const monto = this.calcularMontoPorcentaje(porcentaje);
    this.pagoForm.patchValue({ monto_adelanto: monto });
    this.pagoForm.get('monto_adelanto')?.markAsDirty();
    this.pagoForm.get('monto_adelanto')?.markAsTouched();
  }

  calcularMontoPorcentaje(porcentaje: number): number {
    const total = this.confirmacionPedido?.cotizacion?.costoTotal || 0;
    return Math.round(((total * porcentaje) / 100) * 100) / 100;
  }

  calcularMinimoAdelanto(): number {
    return this.calcularMontoPorcentaje(30);
  }

  calcularPorcentajeAdelanto(): number {
    const monto = Number(this.pagoForm.get('monto_adelanto')?.value) || 0;
    const total = this.confirmacionPedido?.cotizacion?.costoTotal || 1;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((monto / total) * 100));
  }

  calcularSaldoPendiente(): number {
    const total = this.confirmacionPedido?.cotizacion?.costoTotal || 0;
    const adelanto = Number(this.pagoForm.get('monto_adelanto')?.value) || 0;
    return Math.max(0, Math.round((total - adelanto) * 100) / 100);
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.pagoForm.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['montoMinimo']) return errors['montoMinimo'].mensaje;
    if (errors['montoMaximo']) return errors['montoMaximo'].mensaje;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;

    return '';
  }

  campoEsInvalido(campo: string): boolean {
    const control = this.pagoForm.get(campo);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getEstadoTexto(): string {
    const porcentaje = this.calcularPorcentajeAdelanto();
    if (porcentaje >= 100) return 'PAGADO COMPLETO (100%)';
    if (porcentaje >= 50) return 'ANTICIPO RECOMENDADO (50%+)';
    if (porcentaje >= 30) return 'ANTICIPO MÍNIMO VÁLIDO (30%)';
    return 'ANTICIPO INSUFICIENTE (< 30%)';
  }

  getEstadoColorClass(): string {
    const porcentaje = this.calcularPorcentajeAdelanto();
    if (porcentaje >= 50) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (porcentaje >= 30) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-rose-700 bg-rose-100 border-rose-300';
  }

  confirmarYEnviarProduccion(): void {
    if (this.isLoading) return;

    this.pagoForm.markAllAsTouched();
    if (this.pagoForm.invalid) {
      const errorMonto = this.obtenerErrorCampo('monto_adelanto');
      this.mostrarError(errorMonto || 'Por favor complete todos los datos requeridos correctamente.');
      return;
    }

    this.isLoading = true;
    this.limpiarMensajes();

    const pedidoRequest = {
      idCotizacion: this.confirmacionPedido?.cotizacion.idCotizacion!,
      anticipo: Number(this.pagoForm.get('monto_adelanto')?.value),
      metodoPago: this.pagoForm.get('metodo_pago')?.value,
      observacion: this.pagoForm.get('observaciones')?.value || ''
    };

    console.log('Enviando pedido a backend:', pedidoRequest);

    this.pedidosService.generarPedido(pedidoRequest).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.notificacionService.success('¡Pedido generado exitosamente! Se envió a Taller para producción.');
        this.mostrarExito('¡Pedido generado con éxito! Redirigiendo...');
        setTimeout(() => {
          this.router.navigate(['/home/list-pedidos']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al generar pedido:', error);
        const mensaje = error?.error?.message || 'Error al generar el pedido. Verifique los datos o consulte al administrador.';
        this.notificacionService.error(mensaje);
        this.mostrarError(mensaje);
      }
    });
  }

  imprimirCotizacion(): void {
    window.print();
  }

  cancelar(): void {
    this.router.navigate(['/home/list-cotizaciones']);
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 6000);
  }

  private mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
  }

  private limpiarMensajes(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
