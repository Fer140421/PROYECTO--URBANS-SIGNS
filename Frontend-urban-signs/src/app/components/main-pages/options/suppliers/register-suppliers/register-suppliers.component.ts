import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../../../../core/services/supplier/supplier.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-suppliers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-suppliers.component.html',
  styleUrl: './register-suppliers.component.css'
})
export class RegisterSuppliersComponent {

  notificationService = inject(NotificationService)
  supplierService = inject(SupplierService)
  supplier: any = this.getEmptySupplier();
  supplierForm: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.supplierForm = this.fb.group({
      name_people: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/)
        ]
      ],
      ap: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/)
        ]
      ],
      am: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]*$/)
        ]
      ],
      phone_number: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[67][0-9]{7}$/)
        ]
      ],
      addres: [
        '',
        [
          Validators.maxLength(200),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s#\-.,]+$/)
        ]
      ],
      city: ['', Validators.required]
    });
  }

  registerSupplier() {
    if (this.loading) return;

    if (this.supplierForm.valid) {
      this.loading = true;

      const people = this.supplierForm.value;
      const supplier = {
        city: people.city,
        status: true,
        people: {
          name_people: this.capitalizeWords(people.name_people.trim()),
          ap: this.capitalizeWords(people.ap.trim()),
          am: people.am ? this.capitalizeWords(people.am.trim()) : null,
          phone_number: people.phone_number,
          addres: people.addres ? people.addres.trim() : null,
        }
      };

      this.supplierService.registerSupplier(supplier).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: () => {
          this.loading = false;
          this.resetForm();
          this.notificationService.show('Proveedor registrado con éxito', 'success');
          this.router.navigate(['/home/list-suppliers']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al registrar proveedor:', error);
          const errorMessage = error.error?.message || 'Error al registrar el proveedor';
          this.notificationService.show(errorMessage, 'error');
        }
      });

    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markAllFieldsAsTouched();
      this.notificationService.show('Por favor, complete todos los campos requeridos correctamente', 'error');
    }
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.supplierForm.controls).forEach(key => {
      const control = this.supplierForm.get(key);
      control?.markAsTouched();
    });
  }

  private capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }

  cancel() {
    if (this.loading) return;

    if (this.supplierForm.dirty) {
      if (confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
        this.resetForm();
        this.router.navigate(['/home/list-suppliers']);
      }
    } else {
      this.router.navigate(['/home/list-suppliers']);
    }
  }

  getEmptySupplier() {
    return {
      city: '',
      status: true,
      people: {
        name_people: '',
        ap: '',
        am: '',
        ci: '',
        phone_number: '',
        addres: null
      }
    };
  }

  resetForm() {
    this.supplierForm.reset();
    this.supplierForm.markAsPristine();
    this.supplierForm.markAsUntouched();
  }

  // Getters para acceder fácilmente a los controles en el template
  get name_people() { return this.supplierForm.get('name_people'); }
  get ap() { return this.supplierForm.get('ap'); }
  get am() { return this.supplierForm.get('am'); }
  get phone_number() { return this.supplierForm.get('phone_number'); }
  get addres() { return this.supplierForm.get('addres'); }
  get city() { return this.supplierForm.get('city'); }
}
