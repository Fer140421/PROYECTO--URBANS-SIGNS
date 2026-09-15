import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SesionDetalle, SessionService } from '../../../../../core/services/session/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle-acceso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-acceso.component.html',
  styleUrl: './detalle-acceso.component.css'
})
export class DetalleAccesoComponent {
  @Input() mostrar: boolean = false;
  @Input() idSesion: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  sesionDetalle: SesionDetalle | null = null;
  cargando: boolean = false;
  error: string | null = null;

  // Filtros
  moduloSeleccionado: string = 'TODOS';
  modulosDisponibles: string[] = [];

  constructor(private sesionService: SessionService) { }

  ngOnInit(): void {
    if (this.idSesion) {
      this.cargarDetalleSesion();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idSesion'] && this.idSesion && this.mostrar) {
      this.cargarDetalleSesion();
    }
  }

  cargarDetalleSesion(): void {
    if (!this.idSesion) return;

    this.cargando = true;
    this.error = null;

    this.sesionService.obtenerDetalleSesion(this.idSesion).subscribe({
      next: (detalle) => {
        this.sesionDetalle = detalle;
        this.extraerModulosDisponibles();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle de sesión:', err);
        this.error = 'No se pudo cargar el detalle de la sesión';
        this.cargando = false;
      }
    });
  }

  extraerModulosDisponibles(): void {
    if (!this.sesionDetalle) return;

    const modulos = new Set(this.sesionDetalle.acciones.map(a => a.modulo));
    this.modulosDisponibles = ['TODOS', ...Array.from(modulos).sort()];
  }

  get accionesFiltradas() {
    if (!this.sesionDetalle) return [];

    if (this.moduloSeleccionado === 'TODOS') {
      return this.sesionDetalle.acciones;
    }

    return this.sesionDetalle.acciones.filter(a => a.modulo === this.moduloSeleccionado);
  }

  getAccionesPorModulo(): { modulo: string, cantidad: number }[] {
    if (!this.sesionDetalle) return [];

    const contador = new Map<string, number>();

    this.sesionDetalle.acciones.forEach(accion => {
      const count = contador.get(accion.modulo) || 0;
      contador.set(accion.modulo, count + 1);
    });

    return Array.from(contador.entries())
      .map(([modulo, cantidad]) => ({ modulo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  getIconoModulo(modulo: string): string {
    const iconos: { [key: string]: string } = {
      'CATEGORÍAS': 'ph-folder',
      'PRODUCTOS': 'ph-package',
      'USUARIOS': 'ph-user',
      'PEDIDOS': 'ph-shopping-cart',
      'INVENTARIO': 'ph-warehouse',
      'CONFIGURACIÓN': 'ph-gear'
    };
    return iconos[modulo] || 'ph-circle';
  }

  getColorModulo(modulo: string): string {
    const colores: { [key: string]: string } = {
      'CATEGORÍAS': 'bg-blue-100 text-blue-800 border-blue-200',
      'PRODUCTOS': 'bg-green-100 text-green-800 border-green-200',
      'USUARIOS': 'bg-purple-100 text-purple-800 border-purple-200',
      'PEDIDOS': 'bg-orange-100 text-orange-800 border-orange-200',
      'INVENTARIO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CONFIGURACIÓN': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colores[modulo] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  }

  getEstadoBadgeClass(): string {
    if (!this.sesionDetalle) return '';

    return this.sesionDetalle.estado === 'ACTIVO'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.moduloSeleccionado = 'TODOS';
  }
}
