import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

export interface PortalRegistrationRequest {
  tipoCliente: 'Persona' | 'Empresa';
  ci?: string;
  namePeople?: string;
  ap?: string;
  am?: string;
  razonSocial?: string;
  nit?: string;
  direccion?: string;
  phone: string;
  email: string;
  password: string;
  verificationCode: string;
}

@Injectable({ providedIn: 'root' })
export class PublicRegistrationService {
  private readonly http = inject(HttpClient);

  sendCode(email: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/users/send-code`, { email }, { withCredentials: true });
  }

  verifyCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${API_URL}/users/verify-code`, { email, code }, { withCredentials: true });
  }

  register(request: PortalRegistrationRequest): Observable<void> {
    return this.http.post<void>(`${API_URL}/portal/registro`, request, { withCredentials: true });
  }
}
