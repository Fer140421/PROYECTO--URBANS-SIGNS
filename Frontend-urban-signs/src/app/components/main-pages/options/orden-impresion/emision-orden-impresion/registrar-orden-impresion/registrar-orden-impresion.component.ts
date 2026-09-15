import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionService } from '../../../../../../core/services/cotizacion/cotizacion.service';
import { NotificationService } from '../../../../../../core/services/notification/notification.service';
import { OrdenImpresionService } from '../../../../../../core/services/orden-impresion/orden-impresion.service';
interface ArchivoAdjunto {
  nombre: string;
  tipo: string;
  tamano: number;
  fechaSubida: string;
  base64?: string;
}

interface MaterialItem {
  idMaterial?: number;
  nombreMaterial: string;
  cantidad: number;
  unidadMedida?: string;
}



interface OrdenImpresion {
  numeroOrden: string;
  fecha: string;
  codCotizacion: string;
  codSolicitud: string;
  clienteNombre: string;
  estadoCotizacion: string;
  estadoOrden: string;  // PENDIENTE, EN_PROCESO, COMPLETADA
  trabajos: any[];
  archivos: ArchivoAdjunto[];
  observacionesGenerales?: string;
}

@Component({
  selector: 'app-registrar-orden-impresion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registrar-orden-impresion.component.html',
  styleUrl: './registrar-orden-impresion.component.css'
})
export class RegistrarOrdenImpresionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cotizacionService = inject(CotizacionService);
  private notificacionService = inject(NotificationService);
  private ordenImpresionService = inject(OrdenImpresionService);

  ordenImpresion: OrdenImpresion = {
    numeroOrden: '',
    fecha: new Date().toISOString().split('T')[0],
    codCotizacion: '',
    codSolicitud: '',
    clienteNombre: '',
    estadoCotizacion: '',
    estadoOrden: 'PENDIENTE',
    trabajos: [],
    archivos: [],
    observacionesGenerales: ''
  };

  cotizacionData: any;
  mostrarPreview = false;
  archivoSubiendo = false;
  errorArchivo = '';
  guardando = false;
  isDragging = false;
  idPedido!: number;
  observacionesGenerales?: string;
  tiposTrabajo = [
    { value: 'impresion', label: 'Impresión' },
    { value: 'corte', label: 'Corte' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'diseno', label: 'Diseño' },
    { value: 'efecto_espejo', label: 'Efecto Espejo' },
    { value: 'efecto_esmeril', label: 'Efecto Esmeril' },
    { value: 'laminado', label: 'Laminado' }
  ];

  estadosOrden = [
    { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'EN_PROCESO', label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETADA', label: 'Completada', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELADA', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idCotizacion = Number(params['idCotizacion']);
      this.idPedido = Number(params['idPedido']);

      if (idCotizacion) {
        this.loadCotizacion(idCotizacion);
      }

      this.ordenImpresion.numeroOrden = this.generarNumeroOrden();
    });
  }

  loadCotizacion(id: number) {
    this.cotizacionService.obtenerDetalleCotizacion(id).subscribe({
      next: (data) => {
        this.cotizacionData = data;
        this.mapearCotizacionAOrden(data);
        console.log('Cotización cargada:', data);
        console.log('Orden mapeada:', this.ordenImpresion);
      },
      error: (error) => {
        console.error('Error al cargar cotización:', error);
        alert('Error al cargar la cotización');
      }
    });
  }

  // REEMPLAZA COMPLETAMENTE tu método mapearCotizacionAOrden() con este:

  mapearCotizacionAOrden(cotizacion: any) {
    this.ordenImpresion.codCotizacion = cotizacion.codCotizacion;
    this.ordenImpresion.codSolicitud = cotizacion.codSolicitud;
    this.ordenImpresion.clienteNombre = cotizacion.clienteNombre;
    this.ordenImpresion.estadoCotizacion = cotizacion.estado;

    // Mapear trabajos con sus materiales
    if (cotizacion.trabajos && cotizacion.trabajos.length > 0) {
      this.ordenImpresion.trabajos = cotizacion.trabajos.map((trabajo: any) => {
        const detalle: any = {
          // ⬇️⬇️⬇️ ESTE ES EL CAMPO QUE FALTABA ⬇️⬇️⬇️
          idCotizacionTrabajo: trabajo.idCotizacionTrabajo,  // ✅ 47 - ID correcto para BD
          // ⬆️⬆️⬆️ ESTE ES EL CAMPO QUE FALTABA ⬆️⬆️⬆️

          idTrabajo: trabajo.idTrabajo,                       // 3 - Para referencia
          idSolicitudTrabajo: trabajo.idSolicitudTrabajo,     // 22 - Para referencia
          nombreTrabajo: trabajo.nombreTrabajo,
          cantidad: trabajo.cantidad,
          base: trabajo.base,
          altura: trabajo.altura,
          areaTotal: trabajo.area_total,

          // Campos editables por el usuario
          descripcion: '',
          resolucion: '',
          tipoTrabajo: this.inferirTipoTrabajo(trabajo.nombreTrabajo),
          observaciones: '',

          // Materiales
          materiales: this.mapearMateriales(trabajo.materiales || [])
        };

        console.log('Trabajo mapeado:', detalle);
        return detalle;
      });

      console.log('✅ Todos los trabajos mapeados:', this.ordenImpresion.trabajos);
    }
  }

  mapearMateriales(materiales: any[]): MaterialItem[] {
    return materiales.map(mat => ({
      idMaterial: mat.idMaterial,
      nombreMaterial: mat.nombreMaterial || 'Material sin nombre',
      cantidad: mat.cantidad || 0,
      unidadMedida: mat.unidadMedida || 'unidad'
    }));
  }

  inferirTipoTrabajo(nombreTrabajo: string): string {
    const nombre = nombreTrabajo.toLowerCase();
    if (nombre.includes('impresion') || nombre.includes('banner')) return 'impresion';
    if (nombre.includes('corte')) return 'corte';
    if (nombre.includes('instalacion')) return 'instalacion';
    if (nombre.includes('diseno') || nombre.includes('diseño')) return 'diseno';
    if (nombre.includes('espejo')) return 'efecto_espejo';
    if (nombre.includes('esmeril')) return 'efecto_esmeril';
    if (nombre.includes('laminado')) return 'laminado';
    return 'impresion'; // Por defecto
  }

  generarNumeroOrden(): string {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `OI-${year}${month}-${timestamp}`;
  }

  validarOrden(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.ordenImpresion.clienteNombre) {
      errores.push('No se ha cargado la información del cliente');
    }

    if (this.ordenImpresion.trabajos.length === 0) {
      errores.push('No hay trabajos en la orden');
    }
    return { valido: errores.length === 0, errores };
  }

  guardarOrden() {
    if (this.guardando) return;

    // Validar que haya pedido
    if (!this.idPedido) {
      this.notificacionService.error('No se ha especificado un pedido válido');
      return;
    }

    // Validar que haya trabajos
    if (!this.ordenImpresion.trabajos || this.ordenImpresion.trabajos.length === 0) {
      this.notificacionService.error('No hay trabajos para registrar en la orden');
      return;
    }

    // Validar campos obligatorios en cada trabajo
    const errores: string[] = [];
    this.ordenImpresion.trabajos.forEach((trabajo, index) => {
      if (!trabajo.descripcion || trabajo.descripcion.trim() === '') {
        errores.push(`Trabajo ${index + 1}: La descripción es requerida`);
      }
      if (!trabajo.resolucion || trabajo.resolucion.trim() === '') {
        errores.push(`Trabajo ${index + 1}: La resolución es requerida`);
      }
    });

    if (errores.length > 0) {
      this.notificacionService.error('Complete todos los campos:\n' + errores.join('\n'));
      return;
    }

    this.guardando = true;

    // Construir los detalles con el formato correcto
    const detalles: any[] = this.ordenImpresion.trabajos.map(trabajo => {
      const observaciones = this.construirObservacionesDetalle(trabajo);

      return {
        idCotizacionTrabajo: trabajo.idCotizacionTrabajo, // Este viene del JSON de cotización
        observaciones: observaciones
      };
    });

    // Crear el DTO para el backend
    const ordenDTO: any = {
      idPedido: this.idPedido,
      observaciones: this.observacionesGenerales || '',
      detalles: detalles
    };

    // Preparar archivo si existe (tomar el primero)
    let archivoFile: File | undefined = undefined;
    if (this.ordenImpresion.archivos.length > 0) {
      const primerArchivo = this.ordenImpresion.archivos[0];
      if (primerArchivo.base64) {
        try {
          archivoFile = this.ordenImpresionService.base64ToFile(
            primerArchivo.base64,
            primerArchivo.nombre
          );
        } catch (error) {
          console.error('Error al convertir archivo:', error);
          this.notificacionService.error('Error al procesar el archivo adjunto');
          this.guardando = false;
          return;
        }
      }
    }

    console.log('=== DATOS A ENVIAR AL BACKEND ===');
    console.log('Orden DTO:', ordenDTO);
    console.log('Archivo:', archivoFile ? archivoFile.name : 'Sin archivo');

    // Llamar al servicio
    this.ordenImpresionService.registrarOrdenImpresion(ordenDTO, archivoFile)
      .subscribe({
        next: (response) => {
          this.guardando = false;
          console.log('✅ Respuesta del servidor:', response);

          this.notificacionService.show(
            `¡Orden creada exitosamente!`
          );

          this.mostrarPreview = true;

          // Redirigir después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/ordenes-impresion']);
          }, 2000);
        },
        error: (error) => {
          this.guardando = false;
          console.error('❌ Error al guardar orden:', error);

          this.notificacionService.error(
            error.message || 'Error al guardar la orden de impresión'
          );
        }
      });
  }

  /**
   * NUEVO MÉTODO - Construir observaciones detalladas
   */
  private construirObservacionesDetalle(trabajo: any): string {
    const partes: string[] = [];

    // Descripción del trabajo
    if (trabajo.descripcion) {
      partes.push(`Descripción: ${trabajo.descripcion}`);
    }

    // Resolución
    if (trabajo.resolucion) {
      const resolucionTexto = trabajo.resolucion === '1440' ? '1440 DPI - Alta calidad' :
        trabajo.resolucion === '720' ? '720 DPI - Calidad estándar' :
          trabajo.resolucion === 'Troquel' ? 'Troquel - Corte especial' :
            trabajo.resolucion;
      partes.push(`Resolución: ${resolucionTexto}`);
    }

    // Dimensiones
    if (trabajo.base && trabajo.altura) {
      partes.push(`Dimensiones: ${trabajo.base} x ${trabajo.altura} cm (${trabajo.areaTotal} m²)`);
    }

    // Cantidad
    if (trabajo.cantidad) {
      partes.push(`Cantidad: ${trabajo.cantidad} unidades`);
    }

    // Materiales
    if (trabajo.materiales && trabajo.materiales.length > 0) {
      const nombresMateriales = trabajo.materiales
        .map((m: any) => m.nombreMaterial)
        .join(', ');
      partes.push(`Materiales: ${nombresMateriales}`);
    }

    return partes.join(' | ');
  }

  limpiarCamposEditables() {
    if (confirm('¿Deseas limpiar solo los campos editados? Los datos de la cotización se mantendrán.')) {
      this.ordenImpresion.trabajos.forEach(detalle => {
        detalle.descripcion = '';
        detalle.tipoTrabajo = this.inferirTipoTrabajo(detalle.nombreTrabajo);
        detalle.observaciones = '';
      });
      this.ordenImpresion.observacionesGenerales = '';
      this.ordenImpresion.archivos = [];
    }
  }

  // ===== MÉTODOS PARA MANEJO DE ARCHIVOS CON DRAG & DROP =====

  // NUEVO: Método cuando arrastras un archivo sobre el área
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  // NUEVO: Método cuando el archivo sale del área
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  // NUEVO: Método cuando sueltas el archivo
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.subirArchivo(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.subirArchivo(file);
    }
  }

  subirArchivo(file: File) {
    const tiposPermitidos = [
      'application/zip', 'application/x-zip-compressed',
      'application/x-rar-compressed', 'application/vnd.rar',
      'application/x-7z-compressed', 'application/x-tar', 'application/gzip',
      'image/jpeg', 'image/png', 'image/jpg',
      'application/pdf'
    ];

    const extensionesPermitidas = [
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.jpg', '.jpeg', '.png', '.pdf'
    ];

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!tiposPermitidos.includes(file.type) && !extensionesPermitidas.includes(extension)) {
      this.errorArchivo = 'Formato no permitido. Usa: ZIP, RAR, 7Z, TAR, GZ, JPG, PNG o PDF';
      setTimeout(() => this.errorArchivo = '', 5000);
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.errorArchivo = 'El archivo es muy grande. Máximo 50MB';
      setTimeout(() => this.errorArchivo = '', 5000);
      return;
    }

    if (this.ordenImpresion.archivos.some(a => a.nombre === file.name)) {
      this.errorArchivo = 'Ya existe un archivo con este nombre';
      setTimeout(() => this.errorArchivo = '', 5000);
      return;
    }

    this.archivoSubiendo = true;
    this.errorArchivo = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const archivo: ArchivoAdjunto = {
        nombre: file.name,
        tipo: file.type || this.obtenerTipoPorExtension(extension),
        tamano: file.size,
        fechaSubida: new Date().toISOString(),
        base64: e.target.result
      };

      this.ordenImpresion.archivos.push(archivo);
      this.archivoSubiendo = false;

      const input = document.getElementById('fileInput') as HTMLInputElement;
      if (input) input.value = '';
    };

    reader.onerror = () => {
      this.errorArchivo = 'Error al leer el archivo';
      this.archivoSubiendo = false;
      setTimeout(() => this.errorArchivo = '', 5000);
    };

    reader.readAsDataURL(file);
  }

  obtenerTipoPorExtension(extension: string): string {
    const tipos: any = {
      '.zip': 'application/zip',
      '.rar': 'application/vnd.rar',
      '.7z': 'application/x-7z-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf'
    };
    return tipos[extension] || 'application/octet-stream';
  }

  eliminarArchivo(index: number) {
    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      this.ordenImpresion.archivos.splice(index, 1);
    }
  }

  descargarArchivo(archivo: ArchivoAdjunto) {
    if (!archivo.base64) return;

    const link = document.createElement('a');
    link.href = archivo.base64;
    link.download = archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  obtenerIconoArchivo(tipo: string): string {
    if (tipo.includes('zip')) return '📦';
    if (tipo.includes('rar')) return '📦';
    if (tipo.includes('7z')) return '📦';
    if (tipo.includes('tar')) return '📦';
    if (tipo.includes('gzip')) return '📦';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('pdf')) return '📄';
    return '📄';
  }

  getColorEstado(estado: string): string {
    const estadoObj = this.estadosOrden.find(e => e.value === estado);
    return estadoObj?.color || 'bg-gray-100 text-gray-800';
  }

  volverACotizaciones() {
    this.router.navigate(['/cotizaciones']);
  }
}
