import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { UsersService } from '../../core/services/users/users.service';
import { NotificationService } from '../../core/services/notification/notification.service';
import { EmployeeService } from '../../core/services/employee/employee.service';
import { RoleService } from '../../core/services/role/role.service';
import { SolicitudEmailComponent } from './solicitud-email/solicitud-email.component';
import { NewContraseniaComponent } from './new-contrasenia/new-contrasenia.component';
import { VerificationComponent } from './verification/verification.component';

describe('Recovery forms', () => {
  let users: jasmine.SpyObj<UsersService>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    users = jasmine.createSpyObj('UsersService', ['verificarEmailRecuperacion', 'enviarCodigo', 'setEmail', 'getEmail', 'restablecerContrasena', 'clearRecoveryData', 'verificarCodigo', 'setCodeVerified', 'isCodeVerified']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    users.getEmail.and.returnValue('ana@example.com');
    TestBed.configureTestingModule({ providers: [FormBuilder,
      { provide: UsersService, useValue: users }, { provide: Router, useValue: router },
      { provide: NotificationService, useValue: { show: jasmine.createSpy() } },
      { provide: EmployeeService, useValue: {} }, { provide: RoleService, useValue: {} }
    ] });
  });

  it('sends the email captured before disabling the form', fakeAsync(() => {
    users.verificarEmailRecuperacion.and.returnValue(of({ valido: true }));
    users.enviarCodigo.and.returnValue(of({ message: 'OK' }));
    const component = TestBed.runInInjectionContext(() => new SolicitudEmailComponent(TestBed.inject(FormBuilder), router));
    component.email.setValue('ana@example.com');
    void component.enviarCodigo();
    flushMicrotasks();
    expect(users.enviarCodigo).toHaveBeenCalledWith('ana@example.com');
    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/verification']);
  }));

  it('sends the password captured before disabling the form', fakeAsync(() => {
    users.restablecerContrasena.and.returnValue(of({ message: 'OK' }));
    const component = TestBed.runInInjectionContext(() => new NewContraseniaComponent());
    component.passwordForm.setValue({ nuevaContrasena: 'Password123!', confirmarContrasena: 'Password123!' });
    void component.restablecerContrasena();
    flushMicrotasks();
    expect(users.restablecerContrasena).toHaveBeenCalledWith('ana@example.com', 'Password123!');
    expect(users.clearRecoveryData).toHaveBeenCalled();
    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('resends through the delivery method and prevents duplicate requests', () => {
    const response = new Subject<unknown>();
    users.enviarCodigo.and.returnValue(response);
    const component = TestBed.runInInjectionContext(() => new VerificationComponent(TestBed.inject(FormBuilder)));
    component.resendDisabled = false;
    component.resendCode();
    component.resendCode();
    expect(users.enviarCodigo).toHaveBeenCalledOnceWith('ana@example.com');
    expect(users.verificarEmailRecuperacion).not.toHaveBeenCalled();
    response.next({ message: 'OK' });
    response.complete();
    expect(component.processing).toBeFalse();
    component.ngOnDestroy();
  });
});
