import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  sendCode(email: string) {
    return this.http.post<{ message: string }>(`${API_URL}/users/enviar-codigo-recuperacion`, { email });
  }
  verifyCode(email: string, code: string) {
    return this.http.post<{ message: string; resetToken: string }>(`${API_URL}/users/verify-recovery-code`, { email, code });
  }
  reset(email: string, resetToken: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${API_URL}/users/reset-password`, { email, resetToken, newPassword });
  }
}
