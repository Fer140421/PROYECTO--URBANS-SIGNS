import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService } from './users.service';

describe('UsersService password recovery', () => {
  let service: UsersService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
    service.clearRecoveryData();
  });
  afterEach(() => { http.verify(); service.clearRecoveryData(); });

  it('does not trust a browser verification flag or send an unverified reset', () => {
    sessionStorage.setItem('code_verified', 'true');
    expect(service.isCodeVerified()).toBeFalse();
    let rejected = false;
    service.restablecerContrasena('ana@example.com', 'Password123!').subscribe({ error: () => rejected = true });
    expect(rejected).toBeTrue();
    http.expectNone(r => r.url.endsWith('/reset-password'));
  });
  it('passes the token from verification to reset and clears it after completion', () => {
    service.setEmail('ana@example.com');
    service.verificarCodigo('ana@example.com', '123456').subscribe();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ message: 'OK', resetToken: 'opaque-token' });
    expect(service.isCodeVerified()).toBeTrue();
    service.restablecerContrasena('ana@example.com', 'Password123!').subscribe(() => service.clearRecoveryData());
    const request = http.expectOne(r => r.url.endsWith('/reset-password'));
    expect(request.request.body).toEqual({ email: 'ana@example.com', newPassword: 'Password123!', resetToken: 'opaque-token' });
    request.flush({ message: 'OK' });
    expect(service.isCodeVerified()).toBeFalse();
  });
  it('invalidates the previous token when a new code is sent', () => {
    service.verificarCodigo('ana@example.com', '123456').subscribe();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ resetToken: 'opaque-token' });
    service.enviarCodigo('ana@example.com').subscribe();
    http.expectOne(r => r.url.endsWith('/enviar-codigo-recuperacion')).flush({ message: 'OK' });
    expect(service.isCodeVerified()).toBeFalse();
  });
  it('uses the separate administrative endpoint with user ID', () => {
    service.updateUserPassword(42, 'Password123!').subscribe();
    const request = http.expectOne(r => r.url.endsWith('/admin/reset-password'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ userId: 42, newPassword: 'Password123!' });
    request.flush({ message: 'OK' });
  });
});
