import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SesionDetalle {
  idSesion: number;
  nombreUsuario: string;
  correoUsuario: string;
  loginInicio: string;
  loginFin: string | null;
  ipDireccion: string;
  dispositivo: string;
  estado: string;
  duracionSesion: string;
  totalAcciones: number;
  acciones: AccionDetalle[];
}

export interface AccionDetalle {
  idAccion: number;
  descripcion: string;
  modulo: string;
  fechaAccion: string;
  tiempoTranscurrido: string;
}
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API_URL}/session`;

  listarSesiones(
    page: number = 0,
    size: number = 10,
    estado?: string,
    fecha?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (estado) params = params.set('estado', estado);
    if (fecha) {
      // Convertimos la fecha a ISO para el backend
      const inicio = new Date(fecha);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);
      params = params.set('inicio', inicio.toISOString());
      params = params.set('fin', fin.toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/listSession`, { params });
  }

  obtenerDetalleSesion(idSesion: number): Observable<SesionDetalle> {
    return this.http.get<SesionDetalle>(`${this.apiUrl}/${idSesion}/detalle`);
  }

}