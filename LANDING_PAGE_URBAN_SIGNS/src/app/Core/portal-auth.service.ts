import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ClientUser } from './Models/client-portal.model';
import { API_URL } from './config/api.config';

interface PortalProfileResponse {
  idCliente: number;
  tipoCliente: string;
  nombre: string;
  correo: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class PortalAuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly logoutKey = 'urban-signs-logged-out';
  private loggedOut = this.readLogoutState();
  private generation = 0;
  get sessionVersion(): number { return this.generation; }
  readonly currentUser = signal<ClientUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(email: string, password: string): Observable<ClientUser> {
    const version = ++this.generation;
    return this.http.post<void>(`${API_URL}/v1/user/login`, {
      userAcces: email.trim(), passwordAcces: password
    }, { withCredentials: true }).pipe(
      switchMap(() => this.loadProfile(version)),
      map(user => {
        if (!user) throw new Error('Esta cuenta no tiene acceso al portal de clientes.');
        this.setLoggedOut(false);
        return user;
      })
    );
  }

  restoreSession(): Observable<boolean> {
    if (this.loggedOut) return of(false);
    return this.loadProfile().pipe(map(Boolean));
  }

  refreshSession(): Observable<void> {
    return this.http.post<void>(`${API_URL}/users/refresh`, {}, { withCredentials: true });
  }

  clearSession(): void {
    this.generation++;
    this.currentUser.set(null);
  }

  logout(): Observable<void> {
    this.setLoggedOut(true);
    this.clearSession();
    return this.http.post<void>(`${API_URL}/users/logout`, {}, { withCredentials: true }).pipe(
      catchError(() => of(void 0))
    );
  }

  private loadProfile(version = this.generation): Observable<ClientUser | null> {
    return this.http.get<PortalProfileResponse>(`${API_URL}/portal/me`, { withCredentials: true }).pipe(
      map(profile => version === this.generation ? this.toClientUser(profile) : null),
      tap(user => { if (version === this.generation) this.currentUser.set(user); }),
      catchError(() => {
        if (version === this.generation) this.clearSession();
        return of(null);
      })
    );
  }

  private readLogoutState(): boolean {
    try {
      return this.isBrowser && sessionStorage.getItem(this.logoutKey) === 'true';
    } catch { return false; }
  }

  private setLoggedOut(value: boolean): void {
    this.loggedOut = value;
    // Keep an explicit logout across reloads, even if the server is unavailable.
    try {
      if (this.isBrowser) {
        if (value) sessionStorage.setItem(this.logoutKey, 'true');
        else sessionStorage.removeItem(this.logoutKey);
      }
    } catch { /* The in-memory state still applies when storage is unavailable. */ }
  }

  private toClientUser(profile: PortalProfileResponse): ClientUser {
    return {
      id: String(profile.idCliente), name: profile.nombre, email: profile.correo,
      company: profile.tipoCliente === 'Empresa' ? profile.nombre : 'Cliente particular',
      phone: profile.telefono, initials: this.getInitials(profile.nombre)
    };
  }

  private getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }
}
