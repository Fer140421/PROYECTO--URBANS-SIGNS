import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../core/services/users/users.service';

@Component({
  selector: 'app-new-contrasenia',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './new-contrasenia.component.html',
  styleUrl: './new-contrasenia.component.css'
})
export class NewContraseniaComponent implements OnInit {
  private userService = inject(UsersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  passwordForm: FormGroup;
  isLoading: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  email: string = '';
  mostrarNuevaContrasena: boolean = false;
  mostrarConfirmarContrasena: boolean = false;
  fortalezaContrasena: string = '';
  nivelFortaleza: number = 0;
  tieneMinuscula: boolean = false;
  tieneMayuscula: boolean = false;
  tieneNumero: boolean = false;
  tieneSimbolo: boolean = false;

  constructor() {
    this.passwordForm = this.fb.group({
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmarContrasena: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  ngOnInit(): void {
    // Solo validar en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Verificar que el email existe
    const email = this.userService.getEmail();
    if (!email) {
      console.log('❌ No hay email - redirigiendo a solicitud-email');
      this.router.navigate(['/solicitud-email']);
      return;
    }

    // Verificar que el código fue validado
    if (!this.userService.isCodeVerified()) {
      console.log('❌ Código no verificado - redirigiendo a verification');
      this.router.navigate(['/verification']);
      return;
    }

    this.email = email;
    console.log('✅ Componente new-contrasenia inicializado correctamente');

    // Observar cambios en la contraseña
    this.passwordForm.get('nuevaContrasena')?.valueChanges.subscribe(value => {
      this.calcularFortaleza(value);
    });
  }

  get nuevaContrasena() {
    return this.passwordForm.get('nuevaContrasena')!;
  }

  get confirmarContrasena() {
    return this.passwordForm.get('confirmarContrasena')!;
  }

  passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const tieneMinuscula = /[a-z]/.test(value);
      const tieneMayuscula = /[A-Z]/.test(value);
      const tieneNumero = /[0-9]/.test(value);
      const tieneSimbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      const esValida = tieneMinuscula && tieneMayuscula && tieneNumero && tieneSimbolo;

      return esValida ? null : { pattern: true };
    };
  }

  passwordMatchValidator() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const nueva = formGroup.get('nuevaContrasena')?.value;
      const confirmar = formGroup.get('confirmarContrasena')?.value;

      if (!confirmar) return null;

      return nueva === confirmar ? null : { noCoincide: true };
    };
  }

  calcularFortaleza(password: string): void {
    if (!password) {
      this.fortalezaContrasena = '';
      this.nivelFortaleza = 0;
      return;
    }

    this.tieneMinuscula = /[a-z]/.test(password);
    this.tieneMayuscula = /[A-Z]/.test(password);
    this.tieneNumero = /[0-9]/.test(password);
    this.tieneSimbolo = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    let nivel = 0;
    if (password.length >= 8) nivel++;
    if (this.tieneMinuscula && this.tieneMayuscula) nivel++;
    if (this.tieneNumero) nivel++;
    if (this.tieneSimbolo) nivel++;

    this.nivelFortaleza = Math.min(nivel, 3);

    if (nivel <= 1) {
      this.fortalezaContrasena = 'Débil';
    } else if (nivel === 2 || nivel === 3) {
      this.fortalezaContrasena = 'Media';
    } else {
      this.fortalezaContrasena = 'Fuerte';
    }
  }

  async restablecerContrasena(): Promise<void> {
    if (this.isLoading) return;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const email = this.userService.getEmail();
    if (!email) {
      this.mensajeError = 'Sesión expirada. Por favor, vuelve a intentarlo.';
      setTimeout(() => this.router.navigate(['/solicitud-email']), 2000);
      return;
    }

    this.isLoading = true;
    const nuevaPassword = this.nuevaContrasena.value;
    if (new TextEncoder().encode(nuevaPassword).length > 72) {
      this.mensajeError = 'La contraseña es demasiado larga. Usa como máximo 72 bytes UTF-8.';
      this.isLoading = false;
      return;
    }
    this.nuevaContrasena.disable();
    this.confirmarContrasena.disable();
    this.mensajeError = '';
    this.mensajeExito = '';


    try {
      await this.userService.restablecerContrasena(email, nuevaPassword).toPromise();

      this.mensajeExito = '¡Contraseña restablecida exitosamente!';

      // Limpiar los datos del flujo de recuperación
      this.userService.clearRecoveryData();

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.mensajeError = error?.error?.message || 'Error al restablecer la contraseña. Intenta nuevamente.';
      this.nuevaContrasena.enable();
      this.confirmarContrasena.enable();
    } finally {
      this.isLoading = false;
    }
  }

  cancelar(): void {
    this.userService.clearRecoveryData();
    this.router.navigate(['/login']);
  }
}
