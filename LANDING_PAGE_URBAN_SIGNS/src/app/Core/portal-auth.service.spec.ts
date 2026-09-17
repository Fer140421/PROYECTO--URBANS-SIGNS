import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PortalAuthService } from './portal-auth.service';
import { portalSessionInterceptor } from './Interceptors/portal-session.interceptor';

describe('Portal session flows', () => {
  let auth: PortalAuthService;
  let http: HttpTestingController;
  let router: { url: string; navigate: jasmine.Spy };
  const profile = { idCliente: 1, tipoCliente: 'Persona', nombre: 'Ana Perez', correo: 'ana@example.com', telefono: '123' };

  beforeEach(() => {
    sessionStorage.removeItem('urban-signs-logged-out');
    router = { url: '/landing/cotizaciones', navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([portalSessionInterceptor])), provideHttpClientTesting(),
        { provide: Router, useValue: router }]
    });
    auth = TestBed.inject(PortalAuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('urban-signs-logged-out');
  });

  it('keeps guests on the public quotation page when refresh is rejected', () => {
    auth.restoreSession().subscribe(result => expect(result).toBeFalse());
    http.expectOne(r => r.url.endsWith('/portal/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(r => r.url.endsWith('/users/refresh')).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('still redirects an expired session inside the private portal', () => {
    router.url = '/portal/cotizaciones';
    auth.restoreSession().subscribe();
    http.expectOne(r => r.url.endsWith('/portal/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(r => r.url.endsWith('/users/refresh')).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('restores a valid cookie session after refreshing it', () => {
    auth.restoreSession().subscribe(result => expect(result).toBeTrue());
    http.expectOne(r => r.url.endsWith('/portal/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(r => r.url.endsWith('/users/refresh')).flush(null);
    http.expectOne(r => r.url.endsWith('/portal/me')).flush(profile);
    expect(auth.currentUser()?.name).toBe('Ana Perez');
  });

  it('clears immediately and does not restore after logout fails, including a reload', () => {
    auth.restoreSession().subscribe();
    http.expectOne(r => r.url.endsWith('/portal/me')).flush(profile);
    auth.logout().subscribe();
    expect(auth.isAuthenticated()).toBeFalse();
    http.expectOne(r => r.url.endsWith('/users/logout')).flush({}, { status: 500, statusText: 'Server error' });
    auth.restoreSession().subscribe(result => expect(result).toBeFalse());
    const reloaded = TestBed.runInInjectionContext(() => new PortalAuthService());
    reloaded.restoreSession().subscribe(result => expect(result).toBeFalse());
    http.expectNone(r => r.url.endsWith('/portal/me'));
  });

  it('ignores profile responses that arrive after logout', () => {
    auth.restoreSession().subscribe(result => expect(result).toBeFalse());
    const pending = http.expectOne(r => r.url.endsWith('/portal/me'));
    auth.logout().subscribe();
    http.expectOne(r => r.url.endsWith('/users/logout')).flush(null);
    pending.flush(profile);
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('does not retry a pending refresh after logout', () => {
    auth.restoreSession().subscribe(result => expect(result).toBeFalse());
    http.expectOne(r => r.url.endsWith('/portal/me')).flush({}, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne(r => r.url.endsWith('/users/refresh'));
    auth.logout().subscribe();
    http.expectOne(r => r.url.endsWith('/users/logout')).flush(null);
    refresh.flush(null);
    http.expectNone(r => r.url.endsWith('/portal/me'));
    expect(auth.isAuthenticated()).toBeFalse();
  });

  it('allows an explicit login after logout', () => {
    auth.logout().subscribe();
    http.expectOne(r => r.url.endsWith('/users/logout')).flush(null);
    auth.login('ana@example.com', 'password').subscribe();
    http.expectOne(r => r.url.endsWith('/v1/user/login')).flush(null);
    http.expectOne(r => r.url.endsWith('/portal/me')).flush(profile);
    expect(auth.isAuthenticated()).toBeTrue();
    expect(sessionStorage.getItem('urban-signs-logged-out')).toBeNull();
  });
});
