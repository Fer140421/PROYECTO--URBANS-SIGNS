import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../core/services/users/users.service';

@Component({
  selector: 'app-solicitud-email',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitud-email.component.html',
  styleUrl: './solicitud-email.component.css'
})
export class SolicitudEmailComponent {
  private userService = inject(UsersService)
  emailForm: FormGroup;
  isLoading: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.emailForm.get('email')!;
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }

  async enviarCodigo() {
    if (this.isLoading) return;
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const emailValue = this.email.value.trim();
    this.isLoading = true;
    this.email.disable();
    this.mensajeError = '';
    this.mensajeExito = '';


    try {
      await this.userService.verificarEmailRecuperacion(emailValue).toPromise();
      await this.userService.enviarCodigo(emailValue).toPromise();

      this.userService.setEmail(emailValue);

      this.mensajeExito = '¡Código enviado! Revisa tu correo electrónico';
      setTimeout(() => {
        this.router.navigate(['/verification']);
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);

      if (error.status === 400) {
        this.mensajeError = error.error.message || error.error.mensaje || 'El correo electrónico no es válido o no existe.';
      } else if (error.status === 404) {
        this.mensajeError = 'Este correo no está registrado en el sistema.';
      } else {
        this.mensajeError = error.error?.message || 'Error al enviar el código. Intenta nuevamente.';
      }

      this.email.enable();
    } finally {
      this.isLoading = false;
    }
  }

}