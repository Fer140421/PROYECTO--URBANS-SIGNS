import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EmailRequest } from '../../models/users/EmailRequest.model';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private apiUrl = `${environment.API_URL}/users`;
  private resetToken: string | null = null;
  private recoveryEmail: string | null = null;
  private codeVerifiedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  sendCode(email: string): Observable<any> {
    const body: EmailRequest = { email };
    return this.http.post(`${this.apiUrl}/send-code`, body, {
      withCredentials: true
    });
  }

  verifyCode(email: string, code: string): Observable<any> {
    const body: EmailRequest = { email, code };
    return this.http.post(`${this.apiUrl}/verify-code`, body, {
      withCredentials: true
    });
  }

  checkUserExists(userAcces: string): Observable<{ exists: boolean, message: string }> {
    return this.http.get<{ exists: boolean, message: string }>(
      `${this.apiUrl}/exists/${userAcces}`,
      { withCredentials: true }
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    });
  }

  verificarEmailRecuperacion(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-email-recuperacion/${encodeURIComponent(email.trim())}`);
  }

  enviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-codigo-recuperacion`, { email: email.trim() }).pipe(
      tap(() => this.setCodeVerified(false))
    );
  }

  verificarCodigo(email: string, code: string): Observable<any> {
    return this.http.post<{ message: string; resetToken: string }>(`${this.apiUrl}/verify-recovery-code`, { email: email.trim(), code }).pipe(
      tap(response => { this.resetToken = response.resetToken; this.setCodeVerified(!!this.resetToken); })
    );
  }

  restablecerContrasena(email: string, nuevaContrasena: string): Observable<any> {
    if (!this.resetToken) return throwError(() => ({ error: { message: 'Solicita y verifica un nuevo código de recuperación.' } }));
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando contraseña del usuario...');
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email,
      newPassword: nuevaContrasena,
      resetToken: this.resetToken
    }, { context });
  }

  clearEmail(): void {
    this.clearRecoveryData();
  }


  setEmail(email: string): void {
    this.resetToken = null;
    this.recoveryEmail = email.trim();
    if (this.isBrowser) {
      sessionStorage.setItem('recovery_email', email.trim());
      sessionStorage.removeItem('code_verified');
    }
    this.codeVerifiedSubject.next(false);
  }

  getEmail(): string | null {
    if (!this.recoveryEmail && this.isBrowser) {
      this.recoveryEmail = sessionStorage.getItem('recovery_email');
    }
    return this.recoveryEmail;
  }

  setCodeVerified(verified: boolean): void {
    if (!verified) this.resetToken = null;
    this.codeVerifiedSubject.next(verified && !!this.resetToken);
    if (this.isBrowser) sessionStorage.removeItem('code_verified');
  }

  isCodeVerified(): boolean {
    return !!this.resetToken && this.codeVerifiedSubject.value;
  }

  clearRecoveryData(): void {
    this.resetToken = null;
    this.recoveryEmail = null;
    this.codeVerifiedSubject.next(false);
    if (this.isBrowser) {
      sessionStorage.removeItem('recovery_email');
      sessionStorage.removeItem('code_verified');
    }
  }

  isRecoveryFlowActive(): boolean {
    return !!this.getEmail();
  }

  isBrowserPlatform(): boolean {
    return this.isBrowser;
  }

  resetUserEmail(userId: number, newEmail: string): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando correo del usuario...');
    return this.http.post(`${this.apiUrl}/reset-email`, {
      userId,
      newEmail
    }, { context });
  }

  updateUserPassword(userId: number, newPassword: string): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Actualizando contraseña del usuario...');
    return this.http.patch(`${this.apiUrl}/admin/reset-password`, {
      userId,
      newPassword
    }, { context });
  }
}
