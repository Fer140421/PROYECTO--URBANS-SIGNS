import { CommonModule, } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../../../../core/services/role/role.service';
import { Role } from '../../../../../core/models/roles/roles.model';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { UsersService } from '../../../../../core/services/users/users.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import imageCompression from 'browser-image-compression';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register-staff',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-staff.component.html',
  styleUrl: './register-staff.component.css'
})
export class RegisterStaffComponent implements OnInit, OnDestroy {
  router = inject(Router)
  notificationService = inject(NotificationService)
  employeeService = inject(EmployeeService)
  roleService = inject(RoleService)
  userService = inject(UsersService)
  currentStep = 0;
  termsAccepted = false;
  employeeForm: FormGroup;
  userForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  email?: string;
  ListRoles: Role[] = [];
  selectedRole: string = '';
  assignedRoles: Role[] = [];
  errorMessage: string = '';
  enteredEmail: string = '';
  resendDisabled = true;
  resendCountdown = 300;
  countdownInterval: any;
  codeVerified = false;
  codeMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;
  userAcces = '';
  existsMessage = '';
  existsUser = false;
  selectedFile!: File;
  imagePreview: string | null = null;
  readonly MAX_FILE_SIZE_MB = 5;
  // Agregar al inicio de la clase
  isLoadingCode = false;
  isProcessing = false;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      ci: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
      namePeople: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/)]],
      ap: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/)]],
      am: ['', [Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[67]\d{7}$/)]],
      address: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/)]]
    });

    this.userForm = this.fb.group({
      userAcces: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.roleService.getAllRoles().subscribe(data => {
      this.ListRoles = data;
      console.log('Roles disponibles:', this.ListRoles);
    })
    if (this.currentStep === 2) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  checkUser() {
    const userAcces = this.userForm.get('userAcces')?.value?.trim();
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

  addRole(idRole: number) {
    const rol = this.ListRoles.find(cat => cat.idRole === idRole);
    if (rol && !this.assignedRoles.some(r => r.idRole === rol.idRole)) {
      this.assignedRoles.push(rol);
      this.selectedRole = '';
    }
  }

  get availableRoles(): Role[] {
    return this.ListRoles.filter(role =>
      !this.assignedRoles.some(assigned => assigned.idRole === role.idRole)
    );
  }

  removeRole(index: number) {
    this.assignedRoles.splice(index, 1);
  }

  registrarEmpleado() {
    if (this.isProcessing) return;

    const formValuePeople = this.employeeForm.value;
    const formValueUser = this.userForm.value;
    const payload = {
      ci: formValuePeople.ci,
      namePeople: formValuePeople.namePeople,
      ap: formValuePeople.ap,
      am: formValuePeople.am,
      phoneNumber: formValuePeople.phoneNumber,
      address: formValuePeople.address,
      userAcces: formValueUser.userAcces,
      roleIds: this.assignedRoles.map(r => r.idRole)
    };

    console.log(payload)
    this.isProcessing = true;
    this.employeeService.createEmployee(payload, this.selectedFile).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (data: any) => {
        this.generatePdf(data);
        this.notificationService.show('Empleado registrado con éxito', 'success');
        this.router.navigate(['/home/list-staff']);
      },
      error => {
        this.notificationService.show('Error al registrar el empleado', 'error');
      }
    );
  }

  generatePdf(data: any) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Datos del Empleado Registrado', 14, 20);

    doc.setFontSize(12);
    doc.text(`Nombre Completo: ${data.nombreCompleto}`, 14, 35);
    doc.text(`CI: ${data.ci}`, 14, 45);
    doc.text(`Teléfono: ${data.telefono}`, 14, 55);
    doc.text(`Dirección: ${data.direccion}`, 14, 65);
    doc.text(`Correo Electrónico: ${data.correo}`, 14, 75);
    doc.text(`Contraseña Generada: ${data.passwordGenerada}`, 14, 85);

    // Tabla de roles
    autoTable(doc, {
      head: [['Roles asignados']],
      body: data.roles.map((rol: string) => [rol]),
      startY: 105
    });

    // Guardar el PDF con nombre personalizado
    const nombreArchivo = `Empleado-${data.nombreCompleto.replace(/\s/g, '_')}.pdf`;
    doc.save(nombreArchivo);
  }



  onCancel() {
    this.employeeForm.reset();
    this.router.navigate(['/home/list-staff']);
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
      this.countdownInterval = null;
    }

    this.resendDisabled = true;
    this.resendCountdown = 300;

    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;

      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.resendDisabled = false;
        this.resendCountdown = 0;
      }
    }, 1000);
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.resendCountdown / 60);
    const seconds = this.resendCountdown % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  resendCode() {
    if (this.resendDisabled || this.codeVerified) {
      return;
    }

    const email = this.enteredEmail || this.userForm.get('userAcces')?.value;
    if (!email) {
      this.notificationService.show('Email no encontrado.', 'error');
      return;
    }
    this.resendDisabled = true;

    this.userService.sendCode(email).subscribe({
      next: () => {
        this.notificationService.show('Código reenviado exitosamente.', 'info');
        this.startCountdown();
      },
      error: (err) => {
        this.notificationService.show('No se pudo reenviar el código.', 'error');
        this.resendDisabled = false;
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }
    });
  }

  verifyEnteredCode() {
    const email = this.userForm.get('userAcces')?.value;
    const code = this.verificationCode.join('').trim();

    if (code.length !== 6) {
      this.codeMessage = 'Por favor, ingresa el código completo.';
      this.messageType = 'error';
      return;
    }

    this.userService.verifyCode(email, code).subscribe({
      next: (res) => {
        this.codeMessage = res.message || 'Código verificado correctamente.';
        this.messageType = 'success';
        this.codeVerified = true;
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.resendDisabled = true;
      },
      error: (err) => {
        this.codeMessage = err.error?.message || 'Código inválido o expirado.';
        this.messageType = 'error';
        this.codeVerified = false;
        this.verificationCode = ['', '', '', '', '', ''];
      }
    });
  }

  removeImage(): void {
    this.selectedFile = undefined!;
    this.imagePreview = null;
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE_MB = 2; // puedes ajustarlo aquí

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`El archivo supera el tamaño máximo de ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    try {
      const options = {
        maxSizeMB: MAX_FILE_SIZE_MB,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        initialQuality: 0.8,  // controla calidad JPEG
      };
      const compressedFile = await imageCompression(file, options);

      if (compressedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert('No se pudo comprimir la imagen a un tamaño adecuado');
        return;
      }

      this.selectedFile = compressedFile;

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      alert('Error al procesar la imagen');
    }
  }

  nextStep() {
    console.log(this.currentStep)
    // Paso 0 (Datos Personales)
    if (this.currentStep === 0) {
      this.employeeForm.markAllAsTouched();
      if (this.employeeForm.invalid) {
        this.notificationService.show('Por favor, completa todos los datos personales correctamente.', 'error');
        return;
      }

      if (this.assignedRoles.length === 0) {
        this.notificationService.show('Debes asignar al menos un rol al empleado.', 'error');
        return;
      }
    }

    // Paso 1 (Usuario/Email)
    if (this.currentStep === 1) {
      this.userForm.markAllAsTouched();
      if (this.userForm.get('userAcces')?.invalid) {
        this.notificationService.show('Por favor, ingresa un correo electrónico válido.', 'error');
        return;
      }

      if (this.existsUser) {
        this.notificationService.show('El correo electrónico ingresado ya está registrado.', 'error');
        return;
      }

      // Activar pantalla de carga
      this.isLoadingCode = true;

      const email = this.userForm.get('userAcces')?.value;
      this.enteredEmail = email;
      this.email = email;

      // Enviar el código
      this.userService.sendCode(email).subscribe({
        next: (res) => {
          console.log('Código enviado:', res);

          // Pequeño delay para mejor UX (opcional)
          setTimeout(() => {
            this.isLoadingCode = false;
            this.currentStep++;
            this.startCountdown();
            this.notificationService.show('Código enviado exitosamente.', 'success');
          }, 500);
        },
        error: (err) => {
          console.error('Error al enviar código:', err);
          this.isLoadingCode = false;
          this.notificationService.show('No se pudo enviar el código. Intenta nuevamente.', 'error');
        }
      });

      return;
    }

    // Paso 2 (Verificación de código)
    if (this.currentStep === 2) {
      if (!this.codeVerified) {
        this.notificationService.show('Por favor, verifica el código de verificación.', 'error');
        return;
      }
    }

    // Avanzar al siguiente paso
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    console.log(this.currentStep)
    if (this.currentStep > 0) {
      this.currentStep--;

      // Si se vuelve del paso 2 (verificación) al paso 1 (correo)
      if (this.currentStep === 1) {
        // Limpiar el estado de verificación
        this.codeVerified = false;
        this.codeMessage = null;
        this.messageType = null;
        this.verificationCode = ['', '', '', '', '', ''];
        this.codeDigits = Array(6).fill('');

        // Limpiar el contador
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.resendDisabled = false;
        this.resendCountdown = 300;
      }

      // Si se vuelve del paso 1 al paso 0
      if (this.currentStep === 0) {
        this.userForm.get('userAcces')?.reset();
        this.enteredEmail = '';
        this.email = undefined;
        this.codeVerified = false;
        this.codeMessage = null;
        this.messageType = null;
        this.verificationCode = ['', '', '', '', '', ''];
        this.codeDigits = Array(6).fill('');

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }
    }
  }
}
