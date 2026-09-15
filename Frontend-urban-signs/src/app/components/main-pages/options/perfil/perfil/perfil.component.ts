import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../../../core/services/employee/employee.service';
import { EmployeeProfileDTO } from '../../../../../core/models/employee/perfil.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  private employeeService = inject(EmployeeService);

  // Estructura para el formulario (adaptada a tus campos del backend)
  userProfile = {
    firstName: '',
    lastName: '', // Combinación de paternalLastName + maternalLastName
    email: '',
    phone: '',
    department: '',
    address: '',
    role: '',
    avatar: '',
    memberSince: '',
    ci: '',
    stats: {
      projects: 0,
      tasks: 0,
      hours: 0
    }
  };

  originalProfile: any;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.employeeService.getCurrentProfile().subscribe({
      next: (data: EmployeeProfileDTO) => {
        console.log('Datos recibidos del backend:', data);

        // Mapear los datos del backend al formato del formulario
        this.userProfile = {
          firstName: data.firstName,
          lastName: `${data.paternalLastName} ${data.maternalLastName}`.trim(),
          email: data.email,
          phone: data.phoneNumber || '',
          department: data.role, // O el campo que corresponda
          address: data.address || '',
          role: data.role,
          avatar: data.foto || this.getDefaultAvatar(data.firstName, data.paternalLastName),
          memberSince: this.formatDate(data.hireDate),
          ci: data.ci,
          stats: {
            projects: 0, // Agregar lógica real si tienes estos datos
            tasks: 0,
            hours: 0
          }
        };

        this.originalProfile = { ...this.userProfile };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getDefaultAvatar(firstName: string, lastName: string): string {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FCD34D" width="200" height="200"/%3E%3Ctext fill="%23000" font-family="sans-serif" font-size="60" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E${initials}%3C/text%3E%3C/svg%3E`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultAvatar(this.userProfile.firstName, this.userProfile.lastName);
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.avatar = e.target.result;
        console.log('Foto actualizada');
        // Aquí puedes agregar lógica para subir al servidor
      };
      reader.readAsDataURL(file);
    }
  }
}
