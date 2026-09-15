import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { UsuarioEmpleadoDTO } from '../../../../../core/models/employee/usuarioEmpleado.model';
import { UsersService } from '../../../../../core/services/users/users.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-list-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    ViewToggleComponent,
    ResponsiveDataViewComponent,
    DataHeaderDirective,
    DataRowDirective,
    DataCardDirective,
    ActionIconButtonComponent
  ],
  templateUrl: './list-usuarios.component.html',
  styleUrl: './list-usuarios.component.css'
})
export class ListUsuariosComponent implements OnDestroy {
  viewMode: 'list' | 'cards' = 'list';
  empleadoService = inject(EmployeeService);
  userService = inject(UsersService);
  notificationService = inject(NotificationService);
  listUsers: any[] = [];
  filteredUsers: UsuarioEmpleadoDTO[] = [];
  searchTerm: string = '';
  statusFilter: boolean = true;
  selectedUser: any | null = null;

  // Variables para modales
  showResetEmailModal: boolean = false;
  showResetPasswordModal: boolean = false;

  resetEmailStep: number = 1; // 1: Ingresar email, 2: Verificar código, 3: Confirmación
  newEmail: string = '';
  emailExists: boolean = false;
  emailInvalid: boolean = false;
  isSameEmail: boolean = false;
  isLoadingCode: boolean = false;

  // Código de verificación para email
  verificationCode: string[] = ['', '', '', '', '', ''];
  codeDigits = Array(6).fill('');
  emailCodeVerified: boolean = false;
  emailCodeMessage: string = '';
  emailCodeMessageType: 'success' | 'error' = 'success';
  emailResendDisabled: boolean = true;
  emailResendCountdown: number = 300;
  emailCountdownInterval: any;

  // Variables para restablecimiento de contraseña
  passwordMode: 'auto' | 'manual' = 'auto';
  generatedPassword: string = '';
  showGeneratedPassword: boolean = false;
  manualPassword: string = '';
  confirmManualPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordMismatch: boolean = false;

  Math = Math;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  filterStatus: boolean = true;
  isLoading = true;
  isProcessing = false;

  constructor(private fb: FormBuilder) {
    this.generatePassword();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.clearAllIntervals();
  }

  clearAllIntervals(): void {
    if (this.emailCountdownInterval) {
      clearInterval(this.emailCountdownInterval);
      this.emailCountdownInterval = null;
    }
  }

  loadUsers(page: number = 0) {
    this.isLoading = true;
    this.empleadoService.getEmployeeList(page, this.pageSize, this.searchTerm, this.statusFilter).subscribe({
      next: (data) => {
        this.listUsers = data.content;
        this.filteredUsers = [...this.listUsers];
        this.totalPages = data.totalPages;
        this.totalItems = data.totalElements;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.show('Error al cargar usuarios', 'error');
        this.isLoading = false;
      }
    });
  }

  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadUsers();
    }
  }

  searchUsers(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadUsers();
    } else {
      // Si hay texto → aplicar búsqueda
      this.loadUsers();
    }
  }


  openUserModal(user: UsuarioEmpleadoDTO): void {
    this.selectedUser = { ...user };
    this.closeResetEmailModal();
    this.closeResetPasswordModal();
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  toggleUserStatus(user: UsuarioEmpleadoDTO): void {
    const userIndex = this.listUsers.findIndex(u => u.usuario === user.usuario);
    if (userIndex !== -1) {
      this.listUsers[userIndex].estadoUsuario = !this.listUsers[userIndex].estadoUsuario;

      const action = this.listUsers[userIndex].estadoUsuario ? 'activado' : 'desactivado';
      this.notificationService.show(`Usuario ${action} correctamente`, 'success');
    }
  }

  openResetEmailModal(user: UsuarioEmpleadoDTO): void {
    this.selectedUser = { ...user };
    this.showResetEmailModal = true;
    this.resetEmailStep = 1;
    this.newEmail = '';
    this.emailExists = false;
    this.emailInvalid = false;
    this.isSameEmail = false;
    this.emailCodeVerified = false;
    this.verificationCode = ['', '', '', '', '', ''];
    this.clearAllIntervals();
  }

  closeResetEmailModal(): void {
    this.showResetEmailModal = false;
    this.resetEmailStep = 1;
    this.newEmail = '';
    this.emailExists = false;
    this.emailInvalid = false;
    this.isSameEmail = false;
    this.emailCodeVerified = false;
    this.verificationCode = ['', '', '', '', '', ''];
    this.clearAllIntervals();
  }

  checkEmail(): void {
    const email = this.newEmail.trim();

    // Validar formato de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailInvalid = !emailPattern.test(email);

    // Verificar si es el mismo email
    this.isSameEmail = email === this.selectedUser?.usuario;

    // Si el email no es válido o es el mismo, no verificar existencia
    if (this.emailInvalid || this.isSameEmail || email.length < 5) {
      this.emailExists = false;
      return;
    }

    // Verificar si el email ya existe
    this.userService.checkUserExists(email).subscribe(
      res => {
        this.emailExists = res.exists;
      },
      err => {
        console.error(err);
        this.emailExists = false;
      }
    );
  }

  sendEmailVerificationCode(): void {
    this.isLoadingCode = true;

    this.userService.sendCode(this.newEmail).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isLoadingCode = false;
          this.resetEmailStep = 2;
          this.startEmailCountdown();
          this.notificationService.show('Código enviado exitosamente', 'success');
        }, 1000);
      },
      error: (err) => {
        console.error('Error al enviar código:', err);
        this.isLoadingCode = false;
        this.notificationService.show('No se pudo enviar el código. Intenta nuevamente.', 'error');
      }
    });
  }

  startEmailCountdown(): void {
    this.clearAllIntervals();

    this.emailResendDisabled = true;
    this.emailResendCountdown = 300;

    this.emailCountdownInterval = setInterval(() => {
      this.emailResendCountdown--;

      if (this.emailResendCountdown <= 0) {
        clearInterval(this.emailCountdownInterval);
        this.emailCountdownInterval = null;
        this.emailResendDisabled = false;
      }
    }, 1000);
  }

  formatEmailCountdown(): string {
    const minutes = Math.floor(this.emailResendCountdown / 60);
    const seconds = this.emailResendCountdown % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  resendEmailCode(): void {
    if (this.emailResendDisabled || this.emailCodeVerified) {
      return;
    }

    this.userService.sendCode(this.newEmail).subscribe({
      next: () => {
        this.notificationService.show('Código reenviado exitosamente.', 'info');
        this.startEmailCountdown();
      },
      error: (err) => {
        this.notificationService.show('No se pudo reenviar el código.', 'error');
        this.emailResendDisabled = false;
        this.clearAllIntervals();
      }
    });
  }

  verifyEmailCode(): void {
    const code = this.verificationCode.join('').trim();

    if (code.length !== 6) {
      this.emailCodeMessage = 'Por favor, ingresa el código completo.';
      this.emailCodeMessageType = 'error';
      return;
    }

    this.userService.verifyCode(this.newEmail, code).subscribe({
      next: (res) => {
        this.emailCodeMessage = 'Código verificado correctamente.';
        this.emailCodeMessageType = 'success';
        this.emailCodeVerified = true;

        setTimeout(() => {
          this.resetEmailStep = 3;
        }, 1500);
      },
      error: (err) => {
        this.emailCodeMessage = err.error?.message || 'Código inválido o expirado.';
        this.emailCodeMessageType = 'error';
        this.emailCodeVerified = false;
        this.verificationCode = ['', '', '', '', '', ''];
      }
    });
  }

  previousResetEmailStep(): void {
    if (this.resetEmailStep > 1) {
      this.resetEmailStep--;
    }
  }

  completeEmailReset(): void {
    if (this.isProcessing) return;

    console.log('Actualizando correo a:', this.selectedUser);

    this.isProcessing = true;
    this.userService.resetUserEmail(this.selectedUser.idUsuario, this.newEmail).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (res) => {
        this.notificationService.show(`Correo actualizado a: ${this.newEmail}`, 'success');
        this.closeResetEmailModal();
      },
      error: (err) => {
        this.notificationService.error('No se pudo actualizar el correo. Intenta nuevamente.');

      }
    });

  }

  isEmailCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

  autoFocusNext(event: any, index: number): void {
    const input = event.target;
    const nextInput = document.getElementById(`resetCodeInput${index + 1}`);
    if (input.value && nextInput) nextInput.focus();
  }

  autoFocusPrev(event: any, index: number): void {
    const prevInput = document.getElementById(`resetCodeInput${index - 1}`);
    if (!event.target.value && prevInput) prevInput.focus();
  }

  openResetPasswordModal(user: UsuarioEmpleadoDTO): void {
    this.selectedUser = { ...user };
    this.showResetPasswordModal = true;
    this.passwordMode = 'auto';
    this.generatePassword();
    this.manualPassword = '';
    this.confirmManualPassword = '';
    this.passwordMismatch = false;
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal = false;
    this.passwordMode = 'auto';
    this.generatedPassword = '';
    this.manualPassword = '';
    this.confirmManualPassword = '';
    this.passwordMismatch = false;
  }

  generatePassword(): void {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    const randomIndex = (size: number): number => {
      const limit = 256 - (256 % size);
      const value = new Uint8Array(1);
      do { crypto.getRandomValues(value); } while (value[0] >= limit);
      return value[0] % size;
    };
    password += uppercase[randomIndex(uppercase.length)];
    password += lowercase[randomIndex(lowercase.length)];
    password += numbers[randomIndex(numbers.length)];
    password += symbols[randomIndex(symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[randomIndex(allChars.length)];
    }

    const characters = password.split('');
    for (let i = characters.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    this.generatedPassword = characters.join('');
  }

  toggleGeneratedPasswordVisibility(): void {
    this.showGeneratedPassword = !this.showGeneratedPassword;
  }

  toggleManualPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  checkPasswordMatch(): void {
    this.passwordMismatch = this.manualPassword !== this.confirmManualPassword;
  }

  isResetPasswordDisabled(): boolean {
    if (this.passwordMode === 'auto') {
      return !this.generatedPassword;
    } else {
      return !this.manualPassword || !this.confirmManualPassword ||
        this.passwordMismatch || this.manualPassword.length < 8;
    }
  }

  resetPassword(): void {
    if (this.isProcessing) return;

    let passwordToUse = '';
    let message = '';

    if (this.passwordMode === 'auto') {
      passwordToUse = this.generatedPassword;
      message = `Contraseña actualizada para ${this.selectedUser.usuario}. Comparte la contraseña por un canal seguro.`;
    } else {
      passwordToUse = this.manualPassword;
      message = `Contraseña manual establecida para ${this.selectedUser.nombreCompleto}`;
    }

    // Validar contraseña mínima de 8 caracteres
    if (passwordToUse.length < 8) {
      this.notificationService.show('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    this.isProcessing = true;
    this.userService.updateUserPassword(this.selectedUser.idUsuario, passwordToUse).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: (response) => {
        this.notificationService.show(message, 'success');
        // Keep the generated password visible so the manager can copy it before closing.
        if (this.passwordMode === 'manual') this.closeResetPasswordModal();
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        this.notificationService.show(
          error.error?.message || error.error?.error || 'Error al restablecer contraseña',
          'error'
        );
      }
    });
  }
}
