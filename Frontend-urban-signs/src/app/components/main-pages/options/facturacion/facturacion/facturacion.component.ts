import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.css'
})
export class FacturacionComponent {
  facturaForm: FormGroup;
  pedidosPendientes: any[] = [];
  tiposDocumento = [
    { id: 1, nombre: 'Factura' },
    { id: 2, nombre: 'Factura de Exportación' },
    { id: 3, nombre: 'Factura de Compra' }
  ];
  metodosPago = [
    { id: 1, nombre: 'Efectivo' },
    { id: 2, nombre: 'Transferencia Bancaria' },
    { id: 3, nombre: 'Tarjeta de Crédito' },
    { id: 4, nombre: 'Tarjeta de Débito' },
    { id: 5, nombre: 'Cheque' }
  ];

  constructor(private fb: FormBuilder) {
    this.facturaForm = this.fb.group({
      pedidoId: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroFactura: ['', Validators.required],
      codigoControl: ['', Validators.required],
      fechaEmision: ['', Validators.required],
      fechaLimite: ['', Validators.required],
      nitCliente: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      nombreCliente: ['', Validators.required],
      metodoPago: ['', Validators.required],
      montoTotal: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    // Simulación de pedidos pendientes de facturación
    this.cargarPedidosPendientes();
  }

  cargarPedidosPendientes(): void {
    // En una implementación real, esto vendría de un servicio
    this.pedidosPendientes = [
      { id: 1, codigo: 'PED-001', cliente: 'Empresa ABC S.A.', monto: 2500.00, fechaEntrega: '2023-10-15' },
      { id: 2, codigo: 'PED-002', cliente: 'Comercial XYZ Ltda.', monto: 3800.50, fechaEntrega: '2023-10-18' },
      { id: 3, codigo: 'PED-003', cliente: 'Inversiones Global S.R.L.', monto: 1250.75, fechaEntrega: '2023-10-20' }
    ];
  }

  onPedidoSeleccionado(event: any): void {
    const pedidoId = event.target.value;
    const pedidoSeleccionado = this.pedidosPendientes.find(p => p.id == pedidoId);
    
    if (pedidoSeleccionado) {
      this.facturaForm.patchValue({
        nombreCliente: pedidoSeleccionado.cliente,
        montoTotal: pedidoSeleccionado.monto
      });
    }
  }

  onSubmit(): void {
    if (this.facturaForm.valid) {
      console.log('Datos de factura:', this.facturaForm.value);
      // Aquí iría la lógica para guardar la factura
      alert('Factura registrada correctamente');
      this.facturaForm.reset();
    } else {
      alert('Por favor, complete todos los campos requeridos');
    }
  }

  generarCodigoControl(): void {
    // En una implementación real, esto se conectaría con el servicio de Impuestos Nacionales de Bolivia
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.facturaForm.patchValue({ codigoControl: codigo });
  }
}
