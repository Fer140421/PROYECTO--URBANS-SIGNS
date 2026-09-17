import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PasswordRecoveryService } from '../../../Core/password-recovery.service';

@Component({ selector: 'app-pages', imports: [CommonModule, FormsModule, RouterLink], templateUrl: './pages.html', styleUrl: './pages.css' })
export class Pages {
  private readonly recovery = inject(PasswordRecoveryService);
  private resetToken = '';
  private recoveryEmail = '';
  readonly step = signal(1);
  readonly busy = signal(false);
  email = '';
  code = '';
  password = '';
  confirmPassword = '';
  error = '';
  notice = '';

  next(): void {
    if (this.busy() || this.step() === 4) return;
    this.error = '';
    this.notice = '';
    if (this.step() === 1) {
      this.email = this.email.trim();
      if (!/^\S+@\S+\.\S+$/.test(this.email)) { this.error = 'Ingresa un correo electrónico válido.'; return; }
      this.sendCode(this.email);
    } else if (this.step() === 2) {
      if (!/^\d{6}$/.test(this.code)) { this.error = 'Ingresa el código de 6 dígitos.'; return; }
      this.busy.set(true);
      this.recovery.verifyCode(this.recoveryEmail, this.code).pipe(finalize(() => this.busy.set(false))).subscribe({
        next: response => {
          if (!response.resetToken) { this.error = 'No se pudo autorizar el cambio. Solicita otro código.'; return; }
          this.resetToken = response.resetToken;
          this.code = '';
          this.step.set(3);
        },
        error: error => this.showError(error)
      });
    } else {
      if (this.password.length < 8 || new TextEncoder().encode(this.password).length > 72) {
        this.error = 'Usa al menos 8 caracteres y como máximo 72 bytes UTF-8.'; return;
      }
      if (this.password !== this.confirmPassword) { this.error = 'Las contraseñas no coinciden.'; return; }
      if (!this.resetToken) { this.previous(); return; }
      this.busy.set(true);
      this.recovery.reset(this.recoveryEmail, this.resetToken, this.password).pipe(finalize(() => this.busy.set(false))).subscribe({
        next: () => { this.clearSecrets(); this.step.set(4); },
        error: error => {
          if (error.status === 400) { this.clearSecrets(); this.step.set(1); }
          this.showError(error);
        }
      });
    }
  }

  resend(): void {
    if (!this.busy() && this.step() === 2) this.sendCode(this.recoveryEmail);
  }

  previous(): void {
    if (this.busy()) return;
    this.clearSecrets();
    this.error = '';
    this.notice = '';
    this.step.set(1);
  }

  private sendCode(email: string): void {
    this.busy.set(true);
    this.error = '';
    this.notice = '';
    this.recovery.sendCode(email).pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.clearSecrets();
        this.recoveryEmail = email;
        this.step.set(2);
        this.notice = 'Código enviado. Revisa tu correo y la carpeta de spam.';
      },
      error: error => this.showError(error)
    });
  }

  private clearSecrets(): void {
    this.resetToken = '';
    this.code = '';
    this.password = '';
    this.confirmPassword = '';
  }

  private showError(error: { status?: number; error?: { message?: string } }): void {
    this.error = error.status === 0 ? 'No pudimos conectar con el servidor. Inténtalo de nuevo.'
      : error.error?.message || 'No se pudo completar la solicitud. Inténtalo de nuevo.';
  }
}
