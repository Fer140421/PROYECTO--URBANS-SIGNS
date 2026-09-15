import { Injectable, signal } from '@angular/core';

/**
 * Estado visual de sesión. La renovación de credenciales la gestiona el
 * interceptor al recibir un 401; este servicio no hace polling ni refresh.
 */
@Injectable({
  providedIn: 'root'
})
export class SesionService {
  sessionExpired = signal<boolean>(false);

  startMonitoring(): void {
    // Intencionalmente desactivado: no se consulta /users/me cada 30 segundos.
  }

  stopMonitoring(): void {
    // No hay recursos temporizados que liberar.
  }

  restartMonitoring(): void {
    // Se conserva la API pública por compatibilidad con futuras llamadas.
  }

  clearSessionNotice(): void {
    this.sessionExpired.set(false);
  }
}
