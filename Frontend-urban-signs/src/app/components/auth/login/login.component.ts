import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../../core/services/login/login.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {

  loadingService = inject(LoadingService)
  mostrarContrasenia: boolean = false;
  regForm: any;

  showErrorMsg = signal(false);
  errorAutenticacion = signal('');
  errorLoginInvalido = signal(false);
  isLoading = signal(false);
  isLoginBlocked = signal(false);
  lockRemainingSeconds = signal(0);
  lockMessage = signal('Cuenta bloqueada temporalmente.');
  private lockedUntilTimestamp: number | null = null;
  private lockCountdown?: ReturnType<typeof setInterval>;
  private readonly lockStorageKey = 'loginLockedUntil';


  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService) {
    this.regForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(2)]],
      contrasenia: ['', [Validators.required, Validators.maxLength(200), Validators.minLength(3)]]
    });
  }

  get fu() {
    return this.regForm.controls;
  }

  ngOnInit(): void {
    this.restoreTemporaryLock();
  }

  login() {
    if (this.isLoading() || this.isLoginBlocked()) {
      return;
    }

    // Validar formulario
    if (!this.regForm.valid) {
      this.showErrorMsg.set(true);
      this.regForm.markAllAsTouched();
      return;
    }

    // Reset errores
    this.showErrorMsg.set(false);
    this.errorAutenticacion.set('');
    this.errorLoginInvalido.set(false);
    this.isLoading.set(true);

    const xlog = this.regForm.get('usuario')?.value;
    const xclave = this.regForm.get('contrasenia')?.value;

    this.loginService.login(xlog, xclave).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading.set(false);
        this.clearTemporaryLock();
        // ✅ La redirección ahora se hace en el servicio
        // Si quieres hacerla aquí, descomenta la siguiente línea:
        // this.router.navigate(['/home']);
      },
      error: (error: any) => {
        console.error('Error de autenticación:', error);
        this.isLoading.set(false);

        if (error.status === 423) {
          this.handleTemporaryLock(error);
        } else if (error.status === 401 || error.status === 403) {
          this.errorLoginInvalido.set(true);
          this.errorAutenticacion.set('Usuario o contraseña incorrectos.');
        } else {
          this.errorAutenticacion.set('Error al conectar con el servidor. Intenta nuevamente.');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.stopLockCountdown();
  }

  formattedLockTime(): string {
    const totalSeconds = this.lockRemainingSeconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private handleTemporaryLock(error: any): void {
    const errorBody = error.error as { message?: string; lockedUntil?: string; retryAfterSeconds?: number | string } | null;
    const backendMessage = errorBody?.message || 'Cuenta bloqueada temporalmente.';
    const lockedUntilValue = errorBody?.lockedUntil;
    const lockedUntil = lockedUntilValue ? new Date(lockedUntilValue).getTime() : NaN;
    const retryAfterSeconds = this.getRetryAfterSeconds(errorBody?.retryAfterSeconds, error.headers?.get('Retry-After'));
    const lockEnd = retryAfterSeconds !== null
      ? Date.now() + (retryAfterSeconds * 1000)
      : lockedUntil;

    if (!Number.isFinite(lockEnd) || lockEnd <= Date.now()) {
      this.errorAutenticacion.set(backendMessage);
      return;
    }

    if (lockedUntilValue && Number.isFinite(lockedUntil)) {
      this.saveLockedUntil(lockedUntilValue);
    }

    this.lockMessage.set(backendMessage);
    this.startTemporaryLock(lockEnd);
  }

  private restoreTemporaryLock(): void {
    const lockedUntilValue = this.getSavedLockedUntil();
    if (!lockedUntilValue) {
      return;
    }

    const lockedUntil = new Date(lockedUntilValue).getTime();
    if (!Number.isFinite(lockedUntil) || lockedUntil <= Date.now()) {
      this.removeSavedLockedUntil();
      return;
    }

    this.startTemporaryLock(lockedUntil);
  }

  private startTemporaryLock(lockEnd: number): void {
    this.lockedUntilTimestamp = lockEnd;
    this.isLoginBlocked.set(true);
    this.regForm.disable();
    this.updateLockRemainingTime();
    this.stopLockCountdown();
    this.lockCountdown = setInterval(() => this.updateLockRemainingTime(), 1000);
  }

  private updateLockRemainingTime(): void {
    const remainingMilliseconds = (this.lockedUntilTimestamp ?? 0) - Date.now();

    if (remainingMilliseconds <= 0) {
      this.clearTemporaryLock();
      return;
    }

    this.lockRemainingSeconds.set(Math.ceil(remainingMilliseconds / 1000));
  }

  private clearTemporaryLock(): void {
    this.stopLockCountdown();
    this.lockedUntilTimestamp = null;
    this.lockRemainingSeconds.set(0);
    this.isLoginBlocked.set(false);
    this.regForm.enable();
    this.removeSavedLockedUntil();
  }

  private getRetryAfterSeconds(bodyValue: number | string | undefined, headerValue: string | null): number | null {
    const bodySeconds = this.parseSeconds(bodyValue);
    return bodySeconds ?? this.parseSeconds(headerValue ?? undefined);
  }

  private parseSeconds(value: number | string | undefined): number | null {
    const seconds = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : null;
  }

  private saveLockedUntil(lockedUntil: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.lockStorageKey, lockedUntil);
    }
  }

  private getSavedLockedUntil(): string | null {
    return typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(this.lockStorageKey)
      : null;
  }

  private removeSavedLockedUntil(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.lockStorageKey);
    }
  }

  private stopLockCountdown(): void {
    if (this.lockCountdown) {
      clearInterval(this.lockCountdown);
      this.lockCountdown = undefined;
    }
  }
}
