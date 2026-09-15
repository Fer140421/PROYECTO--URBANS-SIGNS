import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';


@Injectable({
  providedIn: 'root'
})
export class OrdenImpresionService {

  private apiUrl = `${environment.API_URL}/ordenes-impresion`;
  constructor(private http: HttpClient) { }

  getOrdenesPaginadas(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl + '/listOrdenImpresion', { params });
  }

  /**
   * Registra una nueva orden de impresión
   */
  registrarOrdenImpresion(orden: any, archivo?: File): Observable<any> {
    const formData = new FormData();

    // Agregar el objeto orden como JSON string (blob)
    const ordenBlob = new Blob([JSON.stringify(orden)], {
      type: 'application/json'
    });
    formData.append('orden', ordenBlob);

    // Agregar archivo si existe
    if (archivo) {
      formData.append('archivo', archivo, archivo.name);
    }

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando orden de impresión...');
    return this.http.post<any>(
      `${this.apiUrl}/registrar-orden-impresion`,
      formData,
      { context }
    );
  }

  /**
   * Obtiene órdenes filtradas por estado
   */
  getOrdenesPorEstado(estado: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('estado', estado)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/por-estado`, { params });
  }

  /**
   * Descarga el archivo adjunto de una orden
   * CORREGIDO: Ahora usa la ruta correcta del backend
   */
  descargarArchivo(idOrden: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idOrden}/descargar-archivo`, {
      responseType: 'blob'
    });
  }

  /**
   * Cambia el estado de una orden
   * CORREGIDO: Ahora usa la ruta correcta del backend
   */
  cambiarEstado(idOrden: number, nuevoEstado: string): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando estado de la orden...');
    return this.http.patch(`${this.apiUrl}/${idOrden}/cambiar-estado`, {
      estado: nuevoEstado
    }, { context });
  }

  /**
   * Obtiene una orden por ID
   */
  getOrdenById(idOrden: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detalle-orden-impresion/${idOrden}`);
  }

  /**
   * Busca órdenes por término de búsqueda
   */
  buscarOrdenes(termino: string): Observable<any[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Obtiene estadísticas de órdenes
   */
  getEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Verifica si una orden tiene archivo adjunto
   */
  tieneArchivo(idOrden: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idOrden}/tiene-archivo`);
  }

  /**
   * Convierte base64 a File
   */
  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Validar archivo (tamaño y tipo)
   */
  validarArchivo(archivo: File): { valido: boolean; mensaje?: string } {
    const tiposPermitidos = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/octet-stream'
    ];
    const tamanoMaximo = 50 * 1024 * 1024; // 50MB

    const extension = archivo.name.substring(archivo.name.lastIndexOf('.')).toLowerCase();
    const extensionesPermitidas = ['.zip', '.rar', '.7z'];

    if (!tiposPermitidos.includes(archivo.type) &&
      !extensionesPermitidas.includes(extension)) {
      return {
        valido: false,
        mensaje: 'Solo se permiten archivos ZIP, RAR o 7Z'
      };
    }

    if (archivo.size > tamanoMaximo) {
      return {
        valido: false,
        mensaje: 'El archivo no puede superar los 50MB'
      };
    }

    return { valido: true };
  }

  /**
 * Modificar una orden de impresión existente
 */
  modificarOrdenImpresion(
    idOrden: number,
    orden: any,
    archivo?: File
  ): Observable<any> {
    const formData = new FormData();
    const ordenBlob = new Blob([JSON.stringify(orden)], {
      type: 'application/json'
    });
    formData.append('orden', ordenBlob);
    if (archivo) {
      formData.append('archivo', archivo, archivo.name);
    }

    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la orden...');
    return this.http.patch<any>(
      `${this.apiUrl}/${idOrden}/modificar`,
      formData,
      { context }
    );
  }

}
