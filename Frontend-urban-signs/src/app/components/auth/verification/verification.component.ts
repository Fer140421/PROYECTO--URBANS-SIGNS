import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users/users.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { RoleService } from '../../../core/services/role/role.service';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../../core/models/roles/roles.model';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {
  router = inject(Router)
  notificationService = inject(NotificationService)
  employeeService = inject(EmployeeService)
  roleService = inject(RoleService)
  userService = inject(UsersService)
  currentStep = 0;
  termsAccepted = false;
  userForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  email?: string;
  ListRoles: Role[] = [];
  selectedRole: string = '';
  assignedRoles: Role[] = [];
  errorMessage: string = '';
  enteredEmail: string = ''; // para usar en el paso 2
  resendDisabled = true;
  resendCountdown = 300; // 5 minutos en segundos
  countdownInterval: any;
  codeVerified = false;
  processing = false;
  codeMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;
  userAcces = '';
  existsMessage = '';
  existsUser = false;
  private platformId = inject(PLATFORM_ID);


  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      userAcces: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    // Solo ejecutar en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Verificar que existe el email del flujo de recuperación
    const email = this.userService.getEmail();
    if (!email) {
      console.log('❌ No hay email - redirigiendo a solicitud-email');
      this.router.navigate(['/solicitud-email']);
      return;
    }

    console.log('✅ Componente verification inicializado correctamente');

    this.enteredEmail = email;
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  checkUser() {
    const userAcces = this.userForm.get('userAcces')?.value?.trim();

    // Si el campo está vacío o tiene menos de 5 caracteres, no buscar
    if (!userAcces || userAcces.length < 5) {
      this.existsUser = false;
      this.existsMessage = '';
      return;
    }

    this.userService.checkUserExists(userAcces).subscribe(
      res => {
        this.existsUser = res.exists;
        this.existsMessage = res.message;
      },
      err => {
        console.error(err);
        this.existsMessage = 'Error al verificar el usuario';
        this.existsUser = false;
      }
    );
  }

  previousStep() {
    console.log(this.currentStep)
    if (this.currentStep > 0) {
      this.currentStep--;
      if (this.currentStep === 1) {
        this.codeVerified = false;
        this.codeMessage = null;
        this.messageType = null;
        this.verificationCode = ['', '', '', '', '', ''];
        this.codeDigits = Array(6).fill('');
        this.startCountdown();
      }

      if (this.currentStep === 0) {
        this.userForm.get('userAcces')?.reset();
        this.enteredEmail = '';
        this.codeVerified = false;
        this.codeMessage = null;
        this.messageType = null;
        this.verificationCode = ['', '', '', '', '', ''];
        this.codeDigits = Array(6).fill('');
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
      }
    }
  }

  codeDigits = Array(6).fill('');
  verificationCode: string[] = ['', '', '', '', '', ''];

  autoFocusNext(event: any, index: number): void {
    const input = event.target;
    const nextInput = document.getElementById(`codeInput${index + 1}`);
    if (input.value && nextInput) nextInput.focus();
  }

  autoFocusPrev(event: any, index: number): void {
    const prevInput = document.getElementById(`codeInput${index - 1}`);
    if (!event.target.value && prevInput) prevInput.focus();
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.resendDisabled = true;
    this.resendCountdown = 60;

    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.resendDisabled = false;
      }
    }, 1000);
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.resendCountdown / 60);
    const seconds = this.resendCountdown % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  resendCode() {
    if (this.processing || this.resendDisabled || this.codeVerified) return;
    const email = this.userService.getEmail();
    if (!email) return;

    this.processing = true;
    this.userService.enviarCodigo(email).pipe(finalize(() => this.processing = false)).subscribe({
      next: () => {
        this.verificationCode = ['', '', '', '', '', ''];
        this.notificationService.show('Código reenviado exitosamente.', 'info');
        this.startCountdown();
      },
      error: (error) => {
        this.notificationService.show(error.error?.message || 'No se pudo reenviar el código.', 'error');
      }
    });
  }


  verifyEnteredCode() {
    if (this.processing || this.codeVerified) return;
    const email = this.userService.getEmail();
    const code = this.verificationCode.join('').trim();

    if (!email) {
      this.codeMessage = 'Correo electrónico no definido';
      this.messageType = 'error';
      // Redirigir al inicio del flujo
      this.router.navigate(['/solicitud-email']);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      this.codeMessage = 'Por favor, ingresa los 6 dígitos del código.';
      this.messageType = 'error';
      return;
    }

    this.processing = true;
    this.userService.verificarCodigo(email, code).pipe(finalize(() => this.processing = false)).subscribe({
      next: (res) => {
        if (!this.userService.isCodeVerified()) {
          this.codeMessage = 'No se pudo autorizar el cambio. Solicita otro código.';
          this.messageType = 'error';
          return;
        }
        this.codeMessage = res.message || 'Código verificado correctamente.';
        this.messageType = 'success';
        this.codeVerified = true;
        this.userService.setCodeVerified(true);

        setTimeout(() => {
          this.router.navigate(['/new-contrasenia']);
        }, 1000);
      },
      error: (err) => {
        this.codeMessage = err.error?.error || err.error?.message || 'Código incorrecto o expirado.';
        this.messageType = 'error';
        this.codeVerified = false;
        this.userService.setCodeVerified(false);
      },
    });
  }

  cancelRecovery() {
    this.userService.clearRecoveryData();
    this.router.navigate(['/login']);
  }

}
