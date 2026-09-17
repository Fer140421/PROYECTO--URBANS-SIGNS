import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pages } from './pages';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('Pages', () => {
  let component: Pages;
  let fixture: ComponentFixture<Pages>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pages],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pages);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function sendCode() {
    component.email = 'ana@example.com';
    component.next();
    http.expectOne(r => r.url.endsWith('/enviar-codigo-recuperacion')).flush({ message: 'OK' });
  }

  it('waits for delivery and prevents duplicate requests', () => {
    component.email = 'ana@example.com';
    component.next();
    component.next();
    expect(component.step()).toBe(1);
    expect(component.busy()).toBeTrue();
    http.expectOne(r => r.url.endsWith('/enviar-codigo-recuperacion')).flush({ message: 'Correo no disponible' }, { status: 503, statusText: 'Unavailable' });
    expect(component.step()).toBe(1);
    expect(component.busy()).toBeFalse();
    expect(component.error).toBe('Correo no disponible');
  });

  it('rejects an incorrect code and waits for a real token', () => {
    sendCode();
    component.code = '000000';
    component.next();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ message: 'Código incorrecto' }, { status: 400, statusText: 'Bad Request' });
    expect(component.step()).toBe(2);
    component.next();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ message: 'Legacy response without token' });
    expect(component.step()).toBe(2);
  });

  it('passes the verified token to reset and clears passwords on success', () => {
    sendCode();
    component.code = '123456';
    component.next();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ resetToken: 'opaque-token' });
    component.password = component.confirmPassword = 'Password123!';
    component.next();
    const request = http.expectOne(r => r.url.endsWith('/reset-password'));
    expect(request.request.body).toEqual({ email: 'ana@example.com', resetToken: 'opaque-token', newPassword: 'Password123!' });
    request.flush({ message: 'OK' });
    expect(component.step()).toBe(4);
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('resends through the mail endpoint and handles the cooldown', () => {
    sendCode();
    component.resend();
    http.expectOne(r => r.url.endsWith('/enviar-codigo-recuperacion')).flush({ message: 'Espera un minuto' }, { status: 429, statusText: 'Too Many Requests' });
    expect(component.step()).toBe(2);
    expect(component.error).toBe('Espera un minuto');
  });

  it('restarts recovery when the reset token expires', () => {
    sendCode();
    component.code = '123456';
    component.next();
    http.expectOne(r => r.url.endsWith('/verify-recovery-code')).flush({ resetToken: 'opaque-token' });
    component.password = component.confirmPassword = 'Password123!';
    component.next();
    http.expectOne(r => r.url.endsWith('/reset-password')).flush({ message: 'Token expirado' }, { status: 400, statusText: 'Bad Request' });
    expect(component.step()).toBe(1);
    expect(component.password).toBe('');
    expect(component.error).toBe('Token expirado');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
