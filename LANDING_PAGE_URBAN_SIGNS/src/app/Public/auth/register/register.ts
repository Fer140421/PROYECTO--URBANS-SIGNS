import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PortalAuthService } from '../../../Core/portal-auth.service';
import { PortalRegistrationRequest, PublicRegistrationService } from '../../../Core/public-registration.service';

@Component({ selector: 'app-register', imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './register.html', styleUrl: './register.css' })
export class Register {
  readonly currentStep = signal(1);
  readonly isLoading = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly emailVerified = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly tipoCliente = signal<'Persona' | 'Empresa'>('Persona');
  readonly steps = ['Datos personales', 'Correo', 'Verificar correo', 'Contraseña'];
  readonly progressPercentage = computed(() => (this.currentStep() / this.steps.length) * 100);
  readonly clienteForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly registration: PublicRegistrationService,
    private readonly auth: PortalAuthService,
    private readonly router: Router
  ) {
    this.clienteForm = this.fb.group({
      ci: ['', Validators.required], name_people: ['', Validators.required], ap: ['', Validators.required], am: [''],
      razon_social: [''], nit: [''], direccion: [''],
      phone_number: ['', [Validators.required, Validators.pattern(/^[67]\d{7}$/)]],
      email: ['', [Validators.required, Validators.email]], verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]], confirmPassword: ['', Validators.required],
    });
  }

  isStepValid(step: number): boolean {
    const personalFields = this.tipoCliente() === 'Persona' ? ['ci', 'name_people', 'ap', 'phone_number'] : ['razon_social', 'nit', 'phone_number'];
    const fields: Record<number, string[]> = { 1: personalFields, 2: ['email'], 3: ['verificationCode'], 4: ['password', 'confirmPassword'] };
    return fields[step].every(field => this.clienteForm.get(field)?.valid) && (step !== 4 || this.passwordsMatch());
  }

  nextStep(): void {
    this.clearFeedback();
    const step = this.currentStep();
    if (!this.isStepValid(step)) { this.markTouched(); return; }
    if (step === 2) { this.sendCode(); return; }
    if (step === 3) { this.verifyCode(); return; }
    this.currentStep.update(value => Math.min(value + 1, 4));
  }

  previousStep(): void {
    if (this.isLoading()) return;
    this.clearFeedback();
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  setTipoCliente(tipo: 'Persona' | 'Empresa'): void {
    this.tipoCliente.set(tipo);
    const personal = ['ci', 'name_people', 'ap'];
    const company = ['razon_social', 'nit'];
    personal.forEach(field => this.clienteForm.get(field)?.setValidators(tipo === 'Persona' ? [Validators.required] : []));
    company.forEach(field => this.clienteForm.get(field)?.setValidators(tipo === 'Empresa' ? [Validators.required] : []));
    [...personal, ...company].forEach(field => this.clienteForm.get(field)?.updateValueAndValidity());
  }

  passwordsMatch(): boolean { return this.clienteForm.get('password')?.value === this.clienteForm.get('confirmPassword')?.value; }
  togglePasswordVisibility(field: 'password' | 'confirm'): void { field === 'password' ? this.showPassword.update(value => !value) : this.showConfirmPassword.update(value => !value); }

  onSubmit(): void {
    this.clearFeedback();
    if (!this.isStepValid(4)) { this.markTouched(); return; }
    if (!this.emailVerified()) { this.errorMessage.set('Debes verificar tu correo antes de crear la cuenta.'); return; }

    const data = this.clienteForm.getRawValue();
    this.isLoading.set(true);
    this.registration.register(this.toRequest(data)).subscribe({
      next: () => this.auth.login(data.email, data.password).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: () => this.router.navigate(['/portal/perfil']),
        error: () => this.errorMessage.set('La cuenta fue creada, pero no pudimos iniciar sesión. Inténtalo desde la página de acceso.')
      }),
      error: error => { this.errorMessage.set(this.registrationError(error)); this.isLoading.set(false); }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.clienteForm.get(field);
    if (control?.hasError('required')) return 'Este campo es obligatorio.';
    if (control?.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (control?.hasError('minlength')) return 'Mínimo 8 caracteres.';
    return field === 'phone_number' ? 'Usa un celular válido, por ejemplo 71234567.' : 'Ingresa los 6 dígitos del código.';
  }

  private sendCode(): void {
    const email = this.clienteForm.get('email')?.value.trim();
    this.emailVerified.set(false);
    this.isLoading.set(true);
    this.registration.sendCode(email).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => { this.message.set('Te enviamos un código de verificación a tu correo.'); this.currentStep.set(3); },
      error: error => this.errorMessage.set(error.status === 503
        ? 'El servicio de correo no está disponible. Inténtalo más tarde o contacta con Urban Signs.'
        : 'No pudimos enviar el código. Verifica tu correo e inténtalo nuevamente.')
    });
  }

  private verifyCode(): void {
    const email = this.clienteForm.get('email')?.value.trim();
    const code = this.clienteForm.get('verificationCode')?.value;
    this.isLoading.set(true);
    this.registration.verifyCode(email, code).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: () => { this.emailVerified.set(true); this.message.set('Correo verificado correctamente.'); this.currentStep.set(4); },
      error: () => this.errorMessage.set('El código no es válido o expiró. Solicita uno nuevo e inténtalo nuevamente.')
    });
  }

  private toRequest(data: Record<string, string>): PortalRegistrationRequest {
    const common = {
      tipoCliente: this.tipoCliente(), phone: data['phone_number'].trim(), email: data['email'].trim(),
      password: data['password'], verificationCode: data['verificationCode']
    };
    return this.tipoCliente() === 'Persona'
      ? { ...common, ci: data['ci'].trim(), namePeople: data['name_people'].trim(), ap: data['ap'].trim(), am: data['am'].trim() || undefined, direccion: data['direccion'].trim() || undefined }
      : { ...common, razonSocial: data['razon_social'].trim(), nit: data['nit'].trim(), direccion: data['direccion'].trim() || undefined };
  }

  private registrationError(error: { status?: number; error?: { message?: string } }): string {
    if (error.status === 409) return error.error?.message || 'El correo, CI o NIT ya está registrado. Revisa tus datos o inicia sesión.';
    return 'No pudimos crear tu cuenta. Inténtalo nuevamente.';
  }

  private clearFeedback(): void { this.message.set(''); this.errorMessage.set(''); }
  private markTouched(): void {
    const fields: Record<number, string[]> = { 1: this.tipoCliente() === 'Persona' ? ['ci', 'name_people', 'ap', 'phone_number'] : ['razon_social', 'nit', 'phone_number'], 2: ['email'], 3: ['verificationCode'], 4: ['password', 'confirmPassword'] };
    fields[this.currentStep()].forEach(field => this.clienteForm.get(field)?.markAsTouched());
  }
}
