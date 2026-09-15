export interface EmployeeProfileDTO {
  idEmployee: number;
  foto: string;
  ci: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  email: string;
  hireDate: string; // LocalDate viene como string desde el backend
  salary: number;
  role: string;
  status: boolean;
}