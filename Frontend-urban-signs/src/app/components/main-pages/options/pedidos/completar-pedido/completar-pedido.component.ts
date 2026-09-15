import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { Empleado } from '../../../../../core/models/employee/ListEmpleadosActivos.model';

interface PagoRegistro {
  monto: number;
  metodoPago: string;
  observacion: string;
}

@Component({
  selector: 'app-completar-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './completar-pedido.component.html',
  styleUrl: './completar-pedido.component.css'
})
export class CompletarPedidoComponent {
  private employeeService = inject(EmployeeService);

  @Input() mostrar: boolean = false;
  @Input() pedido: any | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() completarPedido = new EventEmitter<{
    pedidoId: number;
    pagoFinal?: PagoRegistro;
    fotoArchivo?: File;
    observacionEntrega?: string;
    idEmpleado?: number;
  }>();

  // Datos para completar pedido
  pagoFinal: PagoRegistro = {
    monto: 0,
    metodoPago: 'EFECTIVO',
    observacion: ''
  };

  // Evidencia Fotográfica y Entrega
  fotoArchivo: File | null = null;
  fotoPreview: string | null = null;
  observacionEntrega: string = '';
  idEmpleadoEntrega: number | null = null;
  empleadosActivos: Empleado[] = [];

  confirmarCompletacion: boolean = false;
  procesando: boolean = false;

  ngOnInit(): void {
    this.employeeService.obtenerEmpleadosActivos().subscribe({
      next: (emps) => this.empleadosActivos = emps,
      error: (err) => console.error('Error al cargar empleados activos:', err)
    });
  }

  onFotoSeleccionada(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.fotoArchivo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto(): void {
    this.fotoArchivo = null;
    this.fotoPreview = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pedido'] && this.pedido) {
      console.log('Pedido cargado:', this.pedido);
      this.resetearFormulario();
    }
  }

  /**
   * Resetea el formulario al estado inicial
   */
  resetearFormulario(): void {
    this.pagoFinal = {
      monto: this.pedido?.saldoPendiente || 0,
      metodoPago: 'EFECTIVO',
      observacion: ''
    };
    this.confirmarCompletacion = false;
    this.procesando = false;
    this.fotoArchivo = null;
    this.fotoPreview = null;
    this.observacionEntrega = '';
    this.idEmpleadoEntrega = null;
  }

  /**
   * Valida que se pueda completar el pedido
   */
  puedeCompletar(): boolean {
    // Si hay saldo pendiente, debe registrar el pago
    if (this.pedido.saldoPendiente > 0) {
      return this.pagoFinal.monto > 0 &&
        this.pagoFinal.monto <= this.pedido.saldoPendiente &&
        this.confirmarCompletacion;
    }
    // Si no hay saldo pendiente, solo necesita confirmar
    return this.confirmarCompletacion;
  }


  procesarCompletacion(): void {
    if (this.procesando) return;

    if (!this.puedeCompletar()) {
      alert('Por favor complete todos los campos requeridos y confirme la entrega');
      return;
    }

    if (this.pedido.estadoPedido === 'ENTREGADO') {
      alert('Este pedido ya está marcado como ENTREGADO');
      return;
    }

    if (this.pedido.estadoPedido === 'CANCELADO') {
      alert('No se puede completar un pedido CANCELADO');
      return;
    }

    const mensajeConfirmacion = this.pedido.saldoPendiente > 0
      ? `¿Confirma la entrega del pedido y el registro del pago de ${this.pagoFinal.monto} Bs?`
      : '¿Confirma la entrega del pedido al cliente?';

    if (!confirm(mensajeConfirmacion)) {
      return;
    }

    this.procesando = true;

    const datosCompletacion = {
      pedidoId: this.pedido.idPedido,
      fotoArchivo: this.fotoArchivo || undefined,
      observacionEntrega: this.observacionEntrega || undefined,
      idEmpleado: this.idEmpleadoEntrega ? Number(this.idEmpleadoEntrega) : undefined,
      pagoFinal: this.pedido.saldoPendiente > 0 ? {
        monto: this.pagoFinal.monto,
        metodoPago: this.pagoFinal.metodoPago, 
        observacion: this.pagoFinal.observacion
      } : undefined
    };

    this.completarPedido.emit(datosCompletacion);
  }

  completacionExitosa(): void {
    this.procesando = false;
    alert('¡Pedido completado exitosamente!');
    this.cerrarModal();
  }

  completacionFallida(mensaje: string): void {
    this.procesando = false;
    alert(`Error al completar pedido: ${mensaje}`);
  }

  getCostoTotal(): number {
    return this.pedido?.totalPedido || 0;
  }

  getTotalMateriales(): number {
    if (!this.pedido?.cotizacion?.trabajos) return 0;
    return this.pedido.cotizacion.trabajos.reduce((total: number, trabajo: any) => {
      if (!trabajo.detalles) return total;
      return total + trabajo.detalles.length;
    }, 0);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }


  estaVencida(): boolean {
    if (!this.pedido?.cotizacion?.fechaCaducado) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.pedido.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    return hoy > fechaCaducidad;
  }

  diasRestantes(): number {
    if (!this.pedido?.cotizacion?.fechaCaducado) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCaducidad = new Date(this.pedido.cotizacion.fechaCaducado);
    fechaCaducidad.setHours(0, 0, 0, 0);
    const diferencia = fechaCaducidad.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Obtiene el porcentaje de pago realizado
   */
  getPorcentajePagado(): number {
    if (!this.pedido?.totalPedido || this.pedido.totalPedido === 0) return 0;
    return (this.pedido.anticipo / this.pedido.totalPedido) * 100;
  }

  /**
   * Valida que el monto del pago no exceda el saldo pendiente
   */
  validarMontoPago(): void {
    if (this.pagoFinal.monto > this.pedido.saldoPendiente) {
      this.pagoFinal.monto = this.pedido.saldoPendiente;
    }
    if (this.pagoFinal.monto < 0) {
      this.pagoFinal.monto = 0;
    }
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.resetearFormulario();
    this.cerrar.emit();
  }
}
