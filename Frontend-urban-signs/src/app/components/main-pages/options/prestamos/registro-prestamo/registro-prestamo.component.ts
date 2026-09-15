import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { CommonModule } from '@angular/common';
import { MaterialService } from '../../../../../core/services/materials/material.service';
import { PrestamoService } from '../../../../../core/services/prestamos/prestamo.service';
import { PedidosService } from '../../../../../core/services/pedidos/pedidos.service';
import { PedidoResumen } from '../../../../../core/services/planificacion/planificacion.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-registro-prestamo',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registro-prestamo.component.html',
  styleUrl: './registro-prestamo.component.css'
})
export class RegistroPrestamoComponent implements OnInit {
  isProcessing = false;
  private empleadoService = inject(EmployeeService);
  private materialService = inject(MaterialService);
  private prestamoService = inject(PrestamoService);
  private pedidosService = inject(PedidosService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  ListEmpleadosActivos: any[] = [];
  ListHerramientasActivas: any[] = [];
  pedidosPendientes: PedidoResumen[] = [];
  selectedHerramientaId: number | null = null;
  idEmpleado: number | null = null;
  idPedido: number | null = null;
  observacion: string = '';
  tipoPrestamo?: string;
  fechaPrestamo: string = new Date().toISOString().slice(0, 16);

  HerramientasSeleccionadas: Array<{
    idHerramienta: number;
    nombre: string;
    foto?: string;
    codigo: string;
  }> = [];

  ngOnInit(): void {
    this.loadEmpleadosActivos();
    this.loadHerramientasActivas();
    this.loadPedidosPendientes();

    this.route.queryParams.subscribe(params => {
      if (params['idPedido']) {
        this.idPedido = Number(params['idPedido']);
      }
      if (params['idEmpleado']) {
        this.idEmpleado = Number(params['idEmpleado']);
      }
    });
  }

  loadPedidosPendientes() {
    this.pedidosService.obtenerPedidosPendientes().subscribe({
      next: (pedidos) => this.pedidosPendientes = pedidos,
      error: (err) => console.error('Error fetching pending orders:', err)
    });
  }

  loadEmpleadosActivos() {
    this.empleadoService.obtenerEmpleadosActivos().subscribe({
      next: (data) => this.ListEmpleadosActivos = data,
      error: (err) => console.error('Error fetching active employees:', err)
    });
  }

  loadHerramientasActivas() {
    this.materialService.listarMaterialesActivos().subscribe({
      next: (data) => this.ListHerramientasActivas = data,
      error: (err) => console.error('Error fetching active tools:', err)
    });
  }

  agregarHerramienta() {
    if (this.selectedHerramientaId === null) {
      this.notificationService.info('Seleccione una herramienta');
      return;
    }

    const herramientaExistente = this.HerramientasSeleccionadas.find(h => h.idHerramienta === this.selectedHerramientaId);
    if (herramientaExistente) {
      this.notificationService.info('Herramienta ya agregada');
      return;
    }

    const herramienta = this.ListHerramientasActivas.find(h => h.idHerramienta === this.selectedHerramientaId);
    if (!herramienta) {
      this.notificationService.error('Herramienta no encontrada');
      return;
    }

    this.HerramientasSeleccionadas.push({
      idHerramienta: herramienta.idHerramienta,
      nombre: herramienta.nombre,
      foto: herramienta.foto,
      codigo: herramienta.codigo
    });

    this.selectedHerramientaId = null;
  }

  eliminarHerramienta(index: number) {
    this.HerramientasSeleccionadas.splice(index, 1);
  }

  onSubmit() {
    if (this.isProcessing) return;

    if (!this.idEmpleado) {
      this.notificationService.info('Seleccione un empleado');
      return;
    }

    if (this.HerramientasSeleccionadas.length === 0) {
      this.notificationService.info('Agregue al menos una herramienta');
      return;
    }

    const payload = {
      idEmpleado: Number(this.idEmpleado),
      idPedido: this.idPedido ? Number(this.idPedido) : null,
      observacion: this.observacion || null,
      tipoPrestamo: this.tipoPrestamo,
      detalles: this.HerramientasSeleccionadas.map(h => ({
        idHerramienta: h.idHerramienta
      }))
    };
    console.log(payload);
    this.isProcessing = true;
    this.prestamoService.registrarPrestamo(payload).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.show('Préstamo registrado con éxito', 'success');
        this.router.navigate(['/home/list-prestamos']);
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al registrar préstamo:', err);
        this.notificationService.show('Error al registrar el préstamo', 'error');
      }
    });
  }

  resetForm() {
    this.idEmpleado = null;
    this.idPedido = null;
    this.observacion = '';
    this.fechaPrestamo = new Date().toISOString().slice(0, 16);
    this.HerramientasSeleccionadas = [];
    this.selectedHerramientaId = null;
    this.router.navigate(['/home/list-prestamos']);
  }
}
