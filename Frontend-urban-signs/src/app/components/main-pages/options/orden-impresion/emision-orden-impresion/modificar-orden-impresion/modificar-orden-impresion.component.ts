import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { OrdenImpresionService } from '../../../../../../core/services/orden-impresion/orden-impresion.service';
import { NotificationService } from '../../../../../../core/services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CotizacionService } from '../../../../../../core/services/cotizacion/cotizacion.service';
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
  idOrden?: number;
  numeroOrden: string;
  fecha: string;
  codCotizacion: string;
  codSolicitud: string;
  clienteNombre: string;
  estadoCotizacion: string;
  estadoOrden: string;
  trabajos: any[];
  archivos: ArchivoAdjunto[];
  observacionesGenerales?: string;
}

@Component({
  selector: 'app-modificar-orden-impresion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modificar-orden-impresion.component.html',
  styleUrl: './modificar-orden-impresion.component.css'
})
export class ModificarOrdenImpresionComponent {
  private ordenImpresionService = inject(OrdenImpresionService);
  private cotizacionService = inject(CotizacionService);
  private notificacionService = inject(NotificationService);

  @Input() mostrar: boolean = false;
  @Input() orden: any | null = null;  // Solo recibe { idOrden, nroOrden, etc. }
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

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

  // Nueva propiedad para almacenar datos originales de la orden
  ordenOriginal: any = null;
  cotizacionData: any = null;
  cargando: boolean = false;

  archivoSubiendo = false;
  errorArchivo = '';
  guardando = false;
  isDragging = false;

  estadosOrden = [
    { value: 'PENDIENTE', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'EN_PROCESO', label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETADA', label: 'Completada', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELADA', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ];

  tiposResolucion = [
    { value: '1440', label: '1440 DPI - Alta calidad' },
    { value: '720', label: '720 DPI - Calidad estándar' },
    { value: 'Troquel', label: 'Troquel - Corte especial' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orden'] && this.orden && this.mostrar) {
      console.log('📋 Orden recibida para modificar:', this.orden);
      this.cargarOrdenCompleta(this.orden.idOrden);
    }
  }

  /**
   * 🔑 MÉTODO CLAVE: Carga la orden completa desde el backend
   */
  cargarOrdenCompleta(idOrden: number): void {
    this.cargando = true;

    // 1. Obtener los detalles de la orden desde el backend
    this.ordenImpresionService.getOrdenById(idOrden).subscribe({
      next: (ordenData) => {
        console.log('✅ Orden obtenida del backend:', ordenData);
        this.ordenOriginal = ordenData;

        // 2. Ahora obtenemos la cotización asociada
        const idCotizacion = ordenData.idCotizacion; // O como venga en tu JSON

        if (idCotizacion) {
          this.cargarCotizacionAsociada(idCotizacion, ordenData);
        } else {
          // Si no hay cotización, solo mapeamos la orden
          this.mapearOrdenParaEdicion(ordenData);
          this.cargando = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar orden:', error);
        this.notificacionService.error('Error al cargar los datos de la orden');
        this.cargando = false;
        this.cerrarModal();
      }
    });
  }

  /**
   * Carga la cotización asociada para obtener más detalles
   */
  cargarCotizacionAsociada(idCotizacion: number, ordenData: any): void {
    this.cotizacionService.obtenerDetalleCotizacion(idCotizacion).subscribe({
      next: (cotizacion) => {
        console.log('✅ Cotización asociada:', cotizacion);
        this.cotizacionData = cotizacion;
        this.mapearOrdenYCotizacion(ordenData, cotizacion);
        this.cargando = false;
      },
      error: (error) => {
        console.error('⚠️ Error al cargar cotización, continuando sin ella:', error);
        // Aunque falle la cotización, mostramos la orden
        this.mapearOrdenParaEdicion(ordenData);
        this.cargando = false;
      }
    });
  }

  /**
   * Mapea la orden y la cotización al formato del formulario
   */
  mapearOrdenYCotizacion(ordenData: any, cotizacion: any): void {
    this.ordenImpresion = {
      idOrden: ordenData.idOrden,
      numeroOrden: ordenData.nroOrden,
      fecha: ordenData.fechaEmision.split('T')[0],
      codCotizacion: cotizacion.codCotizacion,
      codSolicitud: cotizacion.codSolicitud,
      clienteNombre: cotizacion.clienteNombre,
      estadoCotizacion: cotizacion.estado,
      estadoOrden: ordenData.estado,
      observacionesGenerales: ordenData.observaciones || '',
      trabajos: [],
      archivos: []
    };

    // Mapear los detalles de la orden con los trabajos de cotización
    if (ordenData.detalles && ordenData.detalles.length > 0) {
      this.ordenImpresion.trabajos = ordenData.detalles.map((detalle: any) => {
        // Buscar el trabajo correspondiente en la cotización
        const trabajoCotizacion = cotizacion.trabajos?.find(
          (t: any) => t.idCotizacionTrabajo === detalle.idCotizacionTrabajo
        );

        // Extraer descripción y resolución de las observaciones del detalle
        const { descripcion, resolucion } = this.extraerCamposDeObservaciones(detalle.observaciones);

        return {
          // IDs necesarios
          idDetalleOrden: detalle.idDetalleOrden, // Para actualizar después
          idCotizacionTrabajo: detalle.idCotizacionTrabajo,

          // Datos de la cotización (solo lectura)
          nombreTrabajo: trabajoCotizacion?.nombreTrabajo || 'Trabajo sin nombre',
          cantidad: trabajoCotizacion?.cantidad || 0,
          base: trabajoCotizacion?.base || 0,
          altura: trabajoCotizacion?.altura || 0,
          areaTotal: trabajoCotizacion?.area_total || 0,
          materiales: this.mapearMateriales(trabajoCotizacion?.materiales || []),

          // Campos editables (extraídos de observaciones)
          descripcion: descripcion,
          resolucion: resolucion
        };
      });
    }

    // Cargar archivo adjunto si existe
    if (ordenData.archivoAdjunto) {
      this.cargarArchivoExistente(ordenData.archivoAdjunto);
    }

    console.log('✅ Orden mapeada para edición:', this.ordenImpresion);
  }

  /**
   * Mapea solo la orden (cuando no hay cotización disponible)
   */
  mapearOrdenParaEdicion(ordenData: any): void {
    this.ordenImpresion = {
      idOrden: ordenData.idOrden,
      numeroOrden: ordenData.nroOrden,
      fecha: ordenData.fechaEmision.split('T')[0],
      codCotizacion: '',
      codSolicitud: '',
      clienteNombre: '',
      estadoCotizacion: '',
      estadoOrden: ordenData.estado,
      observacionesGenerales: ordenData.observaciones || '',
      trabajos: ordenData.detalles?.map((detalle: any) => ({
        idDetalleOrden: detalle.idDetalleOrden,
        idCotizacionTrabajo: detalle.idCotizacionTrabajo,
        nombreTrabajo: 'Trabajo #' + detalle.idDetalleOrden,
        ...this.extraerCamposDeObservaciones(detalle.observaciones),
        materiales: []
      })) || [],
      archivos: []
    };

    if (ordenData.archivoAdjunto) {
      this.cargarArchivoExistente(ordenData.archivoAdjunto);
    }
  }

  /**
   * Extrae descripción y resolución de las observaciones guardadas
   */
  extraerCamposDeObservaciones(observaciones: string): { descripcion: string; resolucion: string } {
    let descripcion = '';
    let resolucion = '';

    if (!observaciones) return { descripcion, resolucion };

    const partes = observaciones.split(' | ');

    partes.forEach(parte => {
      if (parte.startsWith('Descripción:')) {
        descripcion = parte.replace('Descripción:', '').trim();
      } else if (parte.startsWith('Resolución:')) {
        const resTexto = parte.replace('Resolución:', '').trim();
        // Convertir texto a valor
        if (resTexto.includes('1440')) resolucion = '1440';
        else if (resTexto.includes('720')) resolucion = '720';
        else if (resTexto.includes('Troquel')) resolucion = 'Troquel';
      }
    });

    return { descripcion, resolucion };
  }

  /**
   * Carga el archivo adjunto existente de la orden
   */
  cargarArchivoExistente(rutaArchivo: string): void {
    // rutaArchivo = "uploads\\ordenes\\OI-00002.zip"
    const nombreArchivo = rutaArchivo.split('\\').pop() || rutaArchivo;

    // Crear un archivo placeholder (el usuario puede reemplazarlo)
    this.ordenImpresion.archivos = [{
      nombre: nombreArchivo,
      tipo: this.obtenerTipoPorNombre(nombreArchivo),
      tamano: 0, // No conocemos el tamaño
      fechaSubida: this.ordenImpresion.fecha,
      base64: '' // No cargamos el archivo completo para ahorrar memoria
    }];
  }

  obtenerTipoPorNombre(nombre: string): string {
    const extension = nombre.substring(nombre.lastIndexOf('.')).toLowerCase();
    return this.obtenerTipoPorExtension(extension);
  }

  mapearMateriales(materiales: any[]): MaterialItem[] {
    return materiales.map(mat => ({
      idMaterial: mat.idMaterial,
      nombreMaterial: mat.nombreMaterial || 'Material sin nombre',
      cantidad: mat.cantidad || 0,
      unidadMedida: mat.unidadMedida || 'unidad'
    }));
  }

  /**
   * Guarda los cambios de la orden
   */
  guardarCambios(): void {
    if (this.guardando) return;

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    // Construir los detalles actualizados
    const detalles: any[] = this.ordenImpresion.trabajos.map(trabajo => {
      const observaciones = this.construirObservacionesDetalle(trabajo);

      return {
        idDetalleOrden: trabajo.idDetalleOrden,
        idCotizacionTrabajo: trabajo.idCotizacionTrabajo,
        observaciones: observaciones
      };
    });

    const idOrden = this.ordenImpresion.idOrden!;


    const ordenDTO: any = {
      observaciones: this.ordenImpresion.observacionesGenerales || '',
      detalles: detalles
    };

    // Preparar archivo si se subió uno nuevo
    let archivoFile: File | undefined = undefined;
    const archivoNuevo = this.ordenImpresion.archivos.find(a => a.base64);

    if (archivoNuevo?.base64) {
      try {
        archivoFile = this.base64ToFile(
          archivoNuevo.base64,
          archivoNuevo.nombre
        );
      } catch (error) {
        console.error('Error al convertir archivo:', error);
        this.notificacionService.error('Error al procesar el archivo adjunto');
        this.guardando = false;
        return;
      }
    }

    console.log('=== DATOS A ACTUALIZAR ===');
    console.log('Orden DTO:', ordenDTO);
    console.log('Archivo:', archivoFile ? archivoFile.name : 'Sin cambios en archivo');

    // Llamar al servicio de actualización
    this.ordenImpresionService.modificarOrdenImpresion(idOrden, ordenDTO, archivoFile)
      .subscribe({
        next: (response) => {
          this.guardando = false;
          console.log('✅ Orden actualizada:', response);

          this.notificacionService.show('¡Orden actualizada exitosamente!');
          this.guardado.emit();
          this.cerrarModal();
        },
        error: (error) => {
          this.guardando = false;
          console.error('❌ Error al actualizar orden:', error);
          this.notificacionService.error(
            error.message || 'Error al actualizar la orden de impresión'
          );
        }
      });
  }

  // ... (resto de métodos: validarFormulario, construirObservacionesDetalle, 
  // limpiarCamposEditables, manejo de archivos, etc. - mantenerlos igual)

  private validarFormulario(): boolean {
    const errores: string[] = [];

    if (!this.ordenImpresion.estadoOrden) {
      errores.push('El estado de la orden es requerido');
    }

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
      return false;
    }

    return true;
  }

  private construirObservacionesDetalle(trabajo: any): string {
    const partes: string[] = [];

    if (trabajo.descripcion) {
      partes.push(`Descripción: ${trabajo.descripcion}`);
    }

    if (trabajo.resolucion) {
      const resolucionTexto = this.tiposResolucion.find(r => r.value === trabajo.resolucion)?.label || trabajo.resolucion;
      partes.push(`Resolución: ${resolucionTexto}`);
    }

    if (trabajo.base && trabajo.altura) {
      partes.push(`Dimensiones: ${trabajo.base} x ${trabajo.altura} cm (${trabajo.areaTotal} m²)`);
    }

    if (trabajo.cantidad) {
      partes.push(`Cantidad: ${trabajo.cantidad} unidades`);
    }

    if (trabajo.materiales && trabajo.materiales.length > 0) {
      const nombresMateriales = trabajo.materiales
        .map((m: any) => m.nombreMaterial)
        .join(', ');
      partes.push(`Materiales: ${nombresMateriales}`);
    }

    return partes.join(' | ');
  }

  limpiarCamposEditables(): void {
    if (confirm('¿Deseas limpiar solo los campos editados? Los datos originales se mantendrán.')) {
      this.ordenImpresion.trabajos.forEach(trabajo => {
        trabajo.descripcion = '';
        trabajo.resolucion = '';
      });
      this.ordenImpresion.observacionesGenerales = '';

      // Solo limpiar archivos nuevos, mantener el original
      this.ordenImpresion.archivos = this.ordenImpresion.archivos.filter(a => !a.base64);
    }
  }

  getTotalMateriales(): number {
    if (!this.ordenImpresion.trabajos) return 0;
    return this.ordenImpresion.trabajos.reduce((total: number, trabajo: any) => {
      if (!trabajo.materiales) return total;
      return total + trabajo.materiales.length;
    }, 0);
  }

  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  // Métodos de manejo de archivos (mantener los que ya tienes)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.subirArchivo(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirArchivo(file);
    }
  }

  subirArchivo(file: File): void {
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
      this.errorArchivo = 'Formato no permitido';
      setTimeout(() => this.errorArchivo = '', 5000);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorArchivo = 'El archivo es muy grande. Máximo 50MB';
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

      // Reemplazar archivo existente
      this.ordenImpresion.archivos = [archivo];
      this.archivoSubiendo = false;
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

  eliminarArchivo(index: number): void {
    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      this.ordenImpresion.archivos.splice(index, 1);
    }
  }

  descargarArchivo(archivo: ArchivoAdjunto): void {
    if (!archivo.base64) {
      this.notificacionService.error('Este archivo debe descargarse desde el servidor');
      return;
    }

    const link = document.createElement('a');
    link.href = archivo.base64;
    link.download = archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  obtenerIconoArchivo(tipo: string): string {
    if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('7z') || tipo.includes('tar') || tipo.includes('gzip')) return '📦';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('pdf')) return '📄';
    return '📄';
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
