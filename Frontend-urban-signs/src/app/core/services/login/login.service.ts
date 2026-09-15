import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment'
import { isPlatformBrowser } from '@angular/common';
interface LoginResponse {
  success: boolean;
  message: string;
  usuario: string;
  roles: string[];
  permissions?: string[];
}

interface User {
  username: string;
  roles: string[];
  permissions: string[];
}

interface UserMeResponse {
  username?: string;
  usuario?: string;
  roles: string[];
  permissions?: string[];
  email?: string; // si tu backend lo envía
}
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  // Signals
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  // BehaviorSubject para compatibilidad
  private authState$ = new BehaviorSubject<boolean>(false);
  public authState = this.authState$.asObservable();

  private apiUrl = environment.API_URL;
  private loginUrl = `${this.apiUrl}/v1/user/login`;
  private logoutUrl = `${this.apiUrl}/users/logout`;
  private meUrl = `${this.apiUrl}/users/me`;

  // ✅ NUEVO: Control de verificación periódica
  private verificationInterval: any;
  private readonly VERIFICATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
  private isLoggingOut = false; // ✅ Flag para evitar verificaciones durante logout

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadUserFromStorage();
      // ⚠️ DESHABILITADO TEMPORALMENTE para debugging
      // this.startPeriodicVerification();
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const storedUser = localStorage.getItem('currentUser') ?? sessionStorage.getItem('currentUser');
      if (storedUser) {
        const storedUserData = JSON.parse(storedUser);
        const user: User = {
          username: storedUserData.username ?? storedUserData.usuario,
          roles: Array.isArray(storedUserData.roles) ? storedUserData.roles : [],
          permissions: Array.isArray(storedUserData.permissions) ? storedUserData.permissions : []
        };
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.authState$.next(true);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      this.removeFromStorage('currentUser');
    }
  }

  // ✅ NUEVO: Verificación periódica en segundo plano
  private startPeriodicVerification(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
    }

    this.verificationInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        console.log('🔄 Verificación periódica de sesión...');
        this.silentAuthCheck();
      }
    }, this.VERIFICATION_INTERVAL_MS);
  }

  // ✅ NUEVO: Verificación silenciosa (no redirige)
  private silentAuthCheck(): void {
    // ✅ No verificar si estamos haciendo logout
    if (this.isLoggingOut) {
      console.log('⏸️ Verificación pausada - logout en progreso');
      return;
    }

    this.getCurrentUserInfo().pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          console.warn('⚠️ Sesión expirada detectada');
          this.clearCurrentUser();
          this.router.navigate(['/login']);
        }
        return of(null);
      })
    ).subscribe();
  }

  login(xlogin: string, xpass: string): Observable<LoginResponse> {
    const body = {
      userAcces: xlogin,
      passwordAcces: xpass
    };

    return this.http.post<LoginResponse>(this.loginUrl, body, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('✅ Login exitoso:', response);
        if (response.success) {
          const user: User = {
            username: response.usuario,
            roles: response.roles || [],
            permissions: response.permissions || []
          };

          this.saveToStorage('currentUser', JSON.stringify(user));
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          this.authState$.next(true);

          this.redirectByRole(response.roles);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        this.clearCurrentUser();
        throw error;
      })
    );
  }

  logout(): Observable<any> {
    // ✅ Marcar que estamos haciendo logout
    this.isLoggingOut = true;

    // ✅ Detener verificación periódica
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
    }

    return this.http.post(this.logoutUrl, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log('✅ Logout exitoso');
        this.clearCurrentUser();
        this.isLoggingOut = false; // ✅ Resetear flag
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('❌ Error en logout:', error);
        this.clearCurrentUser();
        this.isLoggingOut = false; // ✅ Resetear flag incluso en error
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  getCurrentUserInfo(): Observable<UserMeResponse> {
    return this.http.get<UserMeResponse>(this.meUrl, {
      withCredentials: true
    }).pipe(
      tap(response => {
        const username = response.username || response.usuario;
        if (!username) {
          throw new Error('La respuesta de sesión no contiene usuario.');
        }

        const user: User = {
          username,
          roles: response.roles || [],
          permissions: response.permissions || []
        };

        this.saveToStorage('currentUser', JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.authState$.next(true);
      }),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.clearCurrentUser();
        }
        throw error;
      })
    );
  }

  checkAuthStatus(): void {
    this.getCurrentUserInfo().pipe(
      catchError(error => {
        if (error.status !== 401) {
          console.error('⚠️ Error verificando autenticación:', error);
        }
        this.clearCurrentUser();
        return of(null);
      })
    ).subscribe();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user?.roles?.includes(normalizedRole) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    return this.currentUser()?.permissions?.includes(permission) || false;
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  getRoles(): string[] {
    return this.currentUser()?.roles || [];
  }

  getPermissions(): string[] {
    return this.currentUser()?.permissions || [];
  }

  getUsername(): string | null {
    return this.currentUser()?.username || null;
  }

  private redirectByRole(roles: string[]): void {
    const rolesPriority = ['ROLE_ADMIN', 'ROLE_ALMACEN', 'ROLE_VENDEDOR'];

    for (const priority of rolesPriority) {
      if (roles.includes(priority)) {
        const routes: Record<string, string> = {
          'ROLE_ADMIN': '/home',
          'ROLE_ALMACEN': '/home',
          'ROLE_VENDEDOR': '/home'
        };
        this.router.navigate([routes[priority]]);
        return;
      }
    }

    this.router.navigate(['/home']);
  }

  clearCurrentUser(): void {
    // ✅ Detener verificación periódica al limpiar estado
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
      this.verificationInterval = null;
    }

    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authState$.next(false);
    this.removeFromStorage('currentUser');
  }

  private saveToStorage(key: string, value: string): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }
  }

  private removeFromStorage(key: string): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
      }
    }
  }

}
