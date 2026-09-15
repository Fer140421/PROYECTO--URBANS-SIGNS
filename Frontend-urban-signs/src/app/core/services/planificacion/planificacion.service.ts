import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { Observable } from 'rxjs';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';
// ✅ NUEVA INTERFACE
export interface TrabajoDisponible {
  idCotizacionTrabajo: number;
  nombreTrabajo: string;
  descripcionTrabajo: string;
  cantidad: number;
  areaTotal: number;
  subtotal: number;
  yaProgramado: boolean;
}

export interface CrearTrabajoRequest {
  idPlanificacion: number;
  idPedido: number; // ✅ AHORA ES OBLIGATORIO
  areaTrabajo: string;
  idTrabajador?: number;
  trabajador: string;
  fechaProgramada: string;
  horaProgramada?: string;
  observaciones?: string;
}

export interface PlanificacionSemanal {
  idPlanificacion: number;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
  trabajos: TrabajoProgramado[];
  estadisticas: {
    total: number;
    pendientes: number;
    enProceso: number;
    completados: number;
    reprogramados: number;
  };
}

export interface TrabajoProgramado {
  idTrabajoProgramado: number;
  idPlanificacion: number;
  idPedido?: number;
  cliente: string;
  descripcionTrabajo: string;
  areaTrabajo: string;
  direccion: string;
  cotizador: string;
  idTrabajador?: number;
  trabajador: string;
  fechaProgramada: string;
  horaProgramada?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'REPROGRAMADO';
  cumplido: boolean;
  observaciones: string;
}

export interface ReprogramarRequest {
  nuevaFecha: string;
  motivo: string;
}

// ✅ NUEVA INTERFACE PARA PEDIDOS
export interface PedidoResumen {
  idPedido: number;
  cliente: string;
  fechaPedido: string;
  total: number;
  estadoPedido: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanificacionService {
  private apiUrl = `${environment.API_URL}/planificacion`;

  constructor(private http: HttpClient) { }

  crearPlanificacion(fechaInicio: string, usuarioId: number): Observable<PlanificacionSemanal> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('usuarioId', usuarioId.toString());
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Creando planificación semanal...');
    return this.http.post<PlanificacionSemanal>(`${this.apiUrl}/crear`, null, { params, context });
  }

  obtenerPlanificacionActual(): Observable<PlanificacionSemanal> {
    return this.http.get<PlanificacionSemanal>(`${this.apiUrl}/actual`);
  }

  obtenerPorFecha(fecha: string): Observable<PlanificacionSemanal> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<PlanificacionSemanal>(`${this.apiUrl}/por-fecha`, { params });
  }

  listarPlanificaciones(): Observable<PlanificacionSemanal[]> {
    return this.http.get<PlanificacionSemanal[]>(`${this.apiUrl}/listar`);
  }

  crearTrabajo(request: CrearTrabajoRequest): Observable<TrabajoProgramado> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Programando trabajo...');
    return this.http.post<TrabajoProgramado>(`${this.apiUrl}/trabajos/crear`, request, { context });
  }

  actualizarTrabajo(id: number, request: CrearTrabajoRequest): Observable<TrabajoProgramado> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios del trabajo...');
    return this.http.put<TrabajoProgramado>(`${this.apiUrl}/trabajos/${id}`, request, { context });
  }

  eliminarTrabajo(id: number): Observable<void> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando trabajo programado...');
    return this.http.delete<void>(`${this.apiUrl}/trabajos/${id}`, { context });
  }

  marcarCompletado(id: number): Observable<TrabajoProgramado> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Marcando trabajo como completado...');
    return this.http.put<TrabajoProgramado>(`${this.apiUrl}/trabajos/${id}/completar`, {}, { context });
  }

  reprogramarTrabajo(id: number, request: ReprogramarRequest, usuarioId: number): Observable<TrabajoProgramado> {
    const params = new HttpParams().set('usuarioId', usuarioId.toString());
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Reprogramando trabajo...');
    return this.http.put<TrabajoProgramado>(`${this.apiUrl}/trabajos/${id}/reprogramar`, request, { params, context });
  }

  obtenerTrabajosSemana(idPlanificacion: number): Observable<TrabajoProgramado[]> {
    return this.http.get<TrabajoProgramado[]>(`${this.apiUrl}/trabajos/semana/${idPlanificacion}`);
  }

  obtenerTrabajosVencidos(): Observable<TrabajoProgramado[]> {
    return this.http.get<TrabajoProgramado[]>(`${this.apiUrl}/trabajos/vencidos`);
  }

}
