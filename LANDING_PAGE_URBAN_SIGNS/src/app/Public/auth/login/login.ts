import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PortalAuthService } from '../../../Core/portal-auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;
  errorMessage = '';
  isLoading = false;

  constructor(private readonly auth: PortalAuthService, private readonly router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email || this.password.length < 6) {
      this.errorMessage = 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;
    this.auth.login(this.email, this.password).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.router.navigate(['/portal/perfil']),
      error: error => this.errorMessage = this.getLoginError(error)
    });
  }

  private getLoginError(error: { status?: number }): string {
    if (error.status === 401 || error.status === 403) {
      return 'Correo o contraseña incorrectos.';
    }
    return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
  }
}
