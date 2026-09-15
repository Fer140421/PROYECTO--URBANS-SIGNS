import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-clients.component.html',
  styleUrl: './register-clients.component.css'
})
export class RegisterClientsComponent implements OnInit {
  clienteService = inject(ClientesService);
  notificacionService = inject(NotificationService);

  clienteForm: FormGroup;
  tipoCliente: 'Persona' | 'Empresa' = 'Persona';
  isLoading = false;
  clienteRegistrado = false;
  mostrarErrores = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.clienteForm = this.createForm();
  }

  ngOnInit(): void {
    this.configurarCapitalizacionAutomatica();
  }

  createForm(): FormGroup {
    return this.fb.group({
      ci: [''],
      name_people: [''],
      ap: [''],
      am: [''],
      phone_number: [''],

      razon_social: [''],
      nit: [''],
      telefono_empresa: [''],
      direccion: [''],

      correo: ['', Validators.email],
      correo_empresa: ['', Validators.email],
      tipo_cliente: ['normal', Validators.required]
    });
  }

  configurarCapitalizacionAutomatica(): void {
    const camposACapitalizar = [
      'name_people',
      'ap',
      'am',
      'razon_social',
      'direccion'
    ];

    camposACapitalizar.forEach(campo => {
      this.clienteForm.get(campo)?.valueChanges.subscribe(value => {
        if (value && typeof value === 'string' && value.length > 0) {
          const capitalizado = this.capitalizarTexto(value);
          if (value !== capitalizado) {
            this.clienteForm.get(campo)?.setValue(capitalizado, { emitEvent: false });
          }
        }
      });
    });
  }

  private capitalizarTexto(texto: string): string {
    if (!texto) return texto;

    const palabrasExcluidas = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u'];

    return texto
      .split(' ')
      .map((palabra, index) => {
        if (index === 0) {
          return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
        }

        if (palabrasExcluidas.includes(palabra.toLowerCase())) {
          return palabra.toLowerCase();
        }

        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      })
      .join(' ');
  }

  private capitalizarPrimeraLetra(texto: string): string {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  static validadorCI(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const ciPattern = /^[0-9]{5,8}\s*(LP|SC|CB|OR|PO|TJ|CH|BE|PA)?$/i;

    if (!ciPattern.test(control.value)) {
      return { ciInvalido: true };
    }

    return null;
  }

  static validadorNIT(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const nitValue = control.value.toString().replace(/\s/g, '');

    if (!/^[0-9]{7,12}$/.test(nitValue)) {
      return { nitInvalido: true };
    }

    return null;
  }

  static validadorTelefono(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const telefonoValue = control.value.toString().replace(/[\s-]/g, '');

    const celularPattern = /^[67][0-9]{7}$/;
    const fijoPattern = /^[234][0-9]{6,7}$/;

    if (!celularPattern.test(telefonoValue) && !fijoPattern.test(telefonoValue)) {
      return { telefonoInvalido: true };
    }

    return null;
  }

  static validadorTelefonoEmpresa(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const telefonoValue = control.value.toString().replace(/[\s-]/g, '');

    const celularPattern = /^[67][0-9]{7}$/;
    const fijoPattern = /^[234][0-9]{6,7}$/;

    if (!celularPattern.test(telefonoValue) && !fijoPattern.test(telefonoValue)) {
      return { telefonoEmpresaInvalido: true };
    }

    return null;
  }

  static validadorNombre(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const nombrePattern = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;

    if (!nombrePattern.test(control.value)) {
      return { nombreInvalido: true };
    }

    if (control.value.trim().length < 2) {
      return { nombreMuyCorto: true };
    }

    return null;
  }

  static validadorRazonSocial(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    if (control.value.trim().length < 3) {
      return { razonSocialMuyCorta: true };
    }

    return null;
  }

  esFormularioValido(): boolean {
    this.aplicarValidacionesPorTipo();
    return this.clienteForm.valid;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.mostrarErrores = true;
    this.aplicarValidacionesPorTipo();
    this.marcarControlesComoSucios();

    if (this.clienteForm.valid) {
      this.isLoading = true;

      const formData = this.clienteForm.getRawValue();
      let clienteData: any;

      if (this.tipoCliente === 'Persona') {
        clienteData = {
          tipoClientePersonaEmpresa: 'Persona',
          persona: {
            ci: formData.ci.trim().toUpperCase(),
            name_people: this.normalizarTexto(formData.name_people),
            ap: this.normalizarTexto(formData.ap),
            am: formData.am ? this.normalizarTexto(formData.am) : '',
            phone_number: formData.phone_number.replace(/[\s-]/g, ''),
            addres: formData.direccion ? this.normalizarTexto(formData.direccion) : ''
          },
          tipoCliente: formData.tipo_cliente,
          correo: formData.correo ? formData.correo.trim().toLowerCase() : '',
          estado: true
        };
      } else {
        clienteData = {
          tipoClientePersonaEmpresa: 'Empresa',
          empresa: {
            razonSocial: this.normalizarTexto(formData.razon_social),
            nit: formData.nit.replace(/\s/g, ''),
            telefono: formData.telefono_empresa.replace(/[\s-]/g, ''),
            direccion: formData.direccion ? this.normalizarTexto(formData.direccion) : ''
          },
          tipoCliente: formData.tipo_cliente,
          correo: formData.correo_empresa ? formData.correo_empresa.trim().toLowerCase() : '',
          estado: true
        };
      }

      this.clienteService.registrarCliente(clienteData).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (res) => {
          console.log('Cliente registrado:', res);
          this.notificacionService.show('Cliente registrado con éxito', 'success');
          this.isLoading = false;
          this.clienteRegistrado = true;
          this.router.navigate(['/home/list-clients']);
        },
        error: (err) => {
          console.error('Error al registrar cliente', err);
          this.notificacionService.error('Error al registrar cliente');
          this.isLoading = false;
        }
      });

    } else {
      this.mostrarErrores = true;
      this.enfocarPrimerError();
    }
  }

  private normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
      .trim()
      .replace(/\s+/g, ' ');
  }

  enfocarPrimerError(): void {
    const camposRelevantes = this.tipoCliente === 'Persona'
      ? ['ci', 'name_people', 'ap', 'phone_number']
      : ['razon_social', 'nit', 'telefono_empresa'];

    const firstInvalidControl = camposRelevantes.find(key =>
      this.clienteForm.get(key)?.invalid
    );

    if (firstInvalidControl) {
      const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`);
      if (element) {
        (element as HTMLElement).focus();
      }
    }
  }

  aplicarValidacionesPorTipo(): void {
    const camposPersona = ['ci', 'name_people', 'ap', 'phone_number'];
    const camposEmpresa = ['razon_social', 'nit', 'telefono_empresa'];

    [...camposPersona, ...camposEmpresa].forEach(campo => {
      this.clienteForm.get(campo)?.clearValidators();
    });

    if (this.tipoCliente === 'Persona') {
      this.clienteForm.get('ci')?.setValidators([
        Validators.required,
        RegisterClientsComponent.validadorCI
      ]);

      this.clienteForm.get('name_people')?.setValidators([
        Validators.required,
        Validators.minLength(2),
        RegisterClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('ap')?.setValidators([
        Validators.required,
        Validators.minLength(2),
        RegisterClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('am')?.setValidators([
        RegisterClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('phone_number')?.setValidators([
        Validators.required,
        RegisterClientsComponent.validadorTelefono
      ]);
    } else {
      this.clienteForm.get('razon_social')?.setValidators([
        Validators.required,
        Validators.minLength(3),
        RegisterClientsComponent.validadorRazonSocial
      ]);

      this.clienteForm.get('nit')?.setValidators([
        Validators.required,
        RegisterClientsComponent.validadorNIT
      ]);

      this.clienteForm.get('telefono_empresa')?.setValidators([
        Validators.required,
        RegisterClientsComponent.validadorTelefonoEmpresa
      ]);
    }

    setTimeout(() => {
      [...camposPersona, ...camposEmpresa].forEach(campo => {
        this.clienteForm.get(campo)?.updateValueAndValidity({ emitEvent: false });
      });
      this.clienteForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  onTipoClienteChange(tipo: 'Persona' | 'Empresa'): void {
    this.tipoCliente = tipo;
    this.aplicarValidacionesPorTipo();
  }

  resetForm(): void {
    this.clienteForm.reset({ tipo_cliente: 'normal' });
    this.tipoCliente = 'Persona';
    this.clienteRegistrado = false;
    this.mostrarErrores = false;
  }

  marcarControlesComoSucios(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  cancelar() {
    if (this.isLoading) return;

    this.notificacionService.show('Registro de cliente cancelado', 'info');
    this.router.navigate(['/home/list-cotizaciones']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.clienteForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Ingrese un correo electrónico válido';
    if (errors['ciInvalido']) return 'CI inválido. Ej: 1234567 LP';
    if (errors['nitInvalido']) return 'NIT inválido. Debe tener entre 7 y 12 dígitos';
    if (errors['telefonoInvalido']) return 'Teléfono inválido. Ej: 71234567 o 22765432';
    if (errors['telefonoEmpresaInvalido']) return 'Teléfono inválido. Ej: 71234567 o 22765432';
    if (errors['nombreInvalido']) return 'Solo se permiten letras y espacios';
    if (errors['nombreMuyCorto']) return 'Debe tener al menos 2 caracteres';
    if (errors['razonSocialMuyCorta']) return 'Debe tener al menos 3 caracteres';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }
}
