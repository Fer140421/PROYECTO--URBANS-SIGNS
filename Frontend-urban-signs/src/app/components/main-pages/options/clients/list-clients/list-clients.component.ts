import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Category } from '../../../../../core/models/category/category.model';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../core/services/category/category.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../../core/services/clientes/clientes.service';
import { LoadingComponent } from '../../../../../shared/loading/loading/loading.component';
import { ViewToggleComponent } from '../../../../../shared/components/view-toggle/view-toggle.component';
import { ResponsiveDataViewComponent } from '../../../../../shared/components/responsive-data-view/responsive-data-view.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from '../../../../../shared/components/responsive-data-view/data-view-template.directive';
import { ActionIconButtonComponent } from '../../../../../shared/components/action-icon-button/action-icon-button.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-list-clients',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, LoadingComponent, ViewToggleComponent,
    ResponsiveDataViewComponent, DataHeaderDirective, DataRowDirective, DataCardDirective, ActionIconButtonComponent],
  templateUrl: './list-clients.component.html',
  styleUrl: './list-clients.component.css'
})
export class ListClientsComponent implements OnInit {
  viewMode: 'list' | 'cards' = 'list';
  @Input() cliente: any;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();
  notificationService = inject(NotificationService)
  clientService = inject(ClientesService)
  fb = inject(FormBuilder);

  nombreYaExiste: boolean = false;
  Math = Math;
  filteredCategories: Category[] = [];
  listClientes: any[] = [];
  categoriaFilter: string = ''; // normal | destacado | ''
  clienteSeleccionado: any = null;
  isModalOpen = false;
  isEditing = false;
  searchTerm = '';
  statusFilter: 'true' | 'false' | 'todos' = 'true';
  itemsPerPage = 5;
  categoryForm!: FormGroup;
  selectedClienteId: number | null = null;
  isConfirmModalOpen = false;
  confirmMessage = '';
  confirmAction: (() => void) | null = null;
  confirmTitle: string = '';
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  filterStatus: boolean = true;

  clienteForm!: FormGroup;
  tipoCliente: 'Persona' | 'Empresa' = 'Persona';
  isLoading = false;
  isProcessing = false;
  isListLoading = true;
  mostrarErrores = false;
  tipoFilter: string = ''; // Persona | Empresa | ''

  // ============= VALIDADORES PERSONALIZADOS =============

  // Validador para Cédula de Identidad boliviana
  static validadorCI(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const ciPattern = /^[0-9]{5,8}\s*(LP|SC|CB|OR|PO|TJ|CH|BE|PA)?$/i;

    if (!ciPattern.test(control.value)) {
      return { ciInvalido: true };
    }

    return null;
  }

  // Validador para NIT boliviano
  static validadorNIT(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const nitValue = control.value.toString().replace(/\s/g, '');

    if (!/^[0-9]{7,12}$/.test(nitValue)) {
      return { nitInvalido: true };
    }

    return null;
  }

  // Validador para teléfonos bolivianos
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

  // Validador para teléfono de empresa
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

  // Validador para nombres
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

  // Validador para razón social
  static validadorRazonSocial(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    if (control.value.trim().length < 3) {
      return { razonSocialMuyCorta: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.loadClientes();
    this.clienteForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Campos para Persona
      ci: [''],
      name_people: [''],
      ap: [''],
      am: [''],
      phone_number: [''],

      // Campos para Empresa
      razon_social: [''],
      nit: [''],
      telefono_empresa: [''],
      direccion: [''],

      // Campos comunes
      correo: ['', Validators.email],
      correo_empresa: ['', Validators.email],
      tipo_cliente: ['normal', Validators.required],
      estado: [true]
    });
  }

  aplicarValidacionesPorTipo(): void {
    const camposPersona = ['ci', 'name_people', 'ap', 'phone_number'];
    const camposEmpresa = ['razon_social', 'nit', 'telefono_empresa'];

    // Limpiar validadores
    [...camposPersona, ...camposEmpresa].forEach(campo => {
      this.clienteForm.get(campo)?.clearValidators();
    });

    // Aplicar según tipo
    if (this.tipoCliente === 'Persona') {
      this.clienteForm.get('ci')?.setValidators([
        Validators.required,
        ListClientsComponent.validadorCI
      ]);

      this.clienteForm.get('name_people')?.setValidators([
        Validators.required,
        Validators.minLength(2),
        ListClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('ap')?.setValidators([
        Validators.required,
        Validators.minLength(2),
        ListClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('am')?.setValidators([
        ListClientsComponent.validadorNombre
      ]);

      this.clienteForm.get('phone_number')?.setValidators([
        Validators.required,
        ListClientsComponent.validadorTelefono
      ]);
    } else {
      this.clienteForm.get('razon_social')?.setValidators([
        Validators.required,
        Validators.minLength(3),
        ListClientsComponent.validadorRazonSocial
      ]);

      this.clienteForm.get('nit')?.setValidators([
        Validators.required,
        ListClientsComponent.validadorNIT
      ]);

      this.clienteForm.get('telefono_empresa')?.setValidators([
        Validators.required,
        ListClientsComponent.validadorTelefonoEmpresa
      ]);
    }

    // Actualizar validaciones
    setTimeout(() => {
      [...camposPersona, ...camposEmpresa].forEach(campo => {
        this.clienteForm.get(campo)?.updateValueAndValidity({ emitEvent: false });
      });
      this.clienteForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  loadClientes(): void {
    this.isListLoading = true;
    let estado!: boolean;
    if (this.statusFilter === 'true') estado = true;
    else if (this.statusFilter === 'false') estado = false;

    this.clientService.listarClientesPaginados(
      this.currentPage - 1,
      this.pageSize,
      this.searchTerm,
      estado,
      this.tipoFilter,
      this.categoriaFilter // NUEVO
    ).subscribe({
      next: (data) => {
        this.listClientes = data.content;
        console.log(this.listClientes)
        this.totalItems = data.totalElements;
        this.totalPages = data.totalPages;
        this.isListLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isListLoading = false;
      }
    });
  }

  onSearchTermChange(): void {
    if (this.searchTerm.trim() === '') {
      this.loadClientes();
    }
  }

  filterByStatus(): void {
    this.currentPage = 1;
    this.loadClientes();
  }

  filterByCategoria(): void {
    this.currentPage = 1;
    this.loadClientes();
  }

  filterByTipo(): void {
    this.currentPage = 1;
    this.loadClientes();
  }

  marcarControlesComoSucios(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  updateCategory(): void {
    if (this.isProcessing) return;

    this.mostrarErrores = true;
    this.aplicarValidacionesPorTipo();
    this.marcarControlesComoSucios();

    if (this.clienteForm.invalid) {
      this.notificationService.error("Por favor, complete todos los campos obligatorios correctamente.");
      return;
    }

    const formValue = this.clienteForm.value;

    let clientePayload: any = {
      idCliente: this.isEditing ? this.selectedClienteId : undefined,
      tipoCliente: formValue.tipo_cliente,
      estado: formValue.estado,
      correo: this.tipoCliente === 'Persona'
        ? (formValue.correo ? formValue.correo.trim().toLowerCase() : '')
        : (formValue.correo_empresa ? formValue.correo_empresa.trim().toLowerCase() : ''),
      tipoClientePersonaEmpresa: this.tipoCliente
    };

    if (this.tipoCliente === 'Persona') {
      clientePayload.persona = {
        id_people: this.isEditing ? this.clienteSeleccionado?.persona?.id_people : undefined,
        ci: formValue.ci.trim(),
        name_people: formValue.name_people.trim(),
        ap: formValue.ap.trim(),
        am: formValue.am ? formValue.am.trim() : '',
        phone_number: formValue.phone_number.replace(/[\s-]/g, '')
      };
      clientePayload.empresa = null;
    } else if (this.tipoCliente === 'Empresa') {
      clientePayload.empresa = {
        idEmpresa: this.isEditing ? this.clienteSeleccionado?.empresa?.idEmpresa : undefined,
        razonSocial: formValue.razon_social.trim(),
        nit: formValue.nit.replace(/\s/g, ''),
        telefono: formValue.telefono_empresa.replace(/[\s-]/g, ''),
        direccion: formValue.direccion ? formValue.direccion.trim() : ''
      };
      clientePayload.persona = null;
    }

    this.isProcessing = true;
    this.clientService.actualizarCliente(this.selectedClienteId!, clientePayload).pipe(
      finalize(() => this.isProcessing = false)
    ).subscribe({
      next: () => {
        this.notificationService.success("Cliente actualizado con éxito");
        this.loadClientes();
        this.closeModal();
      },
      error: (err) => {
        this.notificationService.error("Error al actualizar cliente");
        console.error(err);
      }
    });
  }

  toggleClienteStatus(cliente: any): void {
    if (this.isProcessing) return;

    const actionText = cliente.estado ? 'ELIMINAR CLIENTE' : 'ACTIVAR CLIENTE';
    const message = `¿Estás seguro de ${cliente.estado ? 'eliminar' : 'activar'} el cliente?`;

    this.openConfirmModal(actionText, message, () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      if (cliente.estado) {
        this.clientService.eliminarCliente(cliente.idCliente).pipe(
          finalize(() => this.isProcessing = false)
        ).subscribe({
          next: () => {
            this.notificationService.success("Cliente eliminado con éxito");
            this.loadClientes();
            this.closeConfirmModal();
          },
          error: (err) => {
            this.notificationService.error("Error al eliminar cliente");
          }
        });
      } else {
        this.clientService.activarCliente(cliente.idCliente).pipe(
          finalize(() => this.isProcessing = false)
        ).subscribe({
          next: () => {
            this.notificationService.success("Cliente activado con éxito");
            this.loadClientes();
            this.closeConfirmModal();
          },
          error: (err) => {
            console.error('Error al activar cliente', err);
            this.notificationService.error("Error al activar cliente");
          }
        });
      }
    });
  }

  openCreateModal(): void {
    this.selectedClienteId = null;
    this.isEditing = false;
    this.categoryForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(cliente: any): void {
    if (this.isProcessing) return;

    this.isEditing = true;
    this.isModalOpen = true;
    this.clienteSeleccionado = cliente;
    this.tipoCliente = cliente.tipoClientePersonaEmpresa;
    this.mostrarErrores = false;

    const commonData = {
      tipo_cliente: cliente.tipoCliente,
      estado: cliente.estado ?? true
    };

    if (this.tipoCliente === 'Persona') {
      this.clienteForm.patchValue({
        ...commonData,
        ci: cliente.persona?.ci || '',
        name_people: cliente.persona?.name_people || '',
        ap: cliente.persona?.ap || '',
        am: cliente.persona?.am || '',
        phone_number: cliente.persona?.phone_number || '',
        correo: cliente.correo || ''
      });
    } else if (this.tipoCliente === 'Empresa') {
      this.clienteForm.patchValue({
        ...commonData,
        razon_social: cliente.empresa?.razonSocial || '',
        nit: cliente.empresa?.nit || '',
        telefono_empresa: cliente.empresa?.telefono || '',
        correo_empresa: cliente.correo || '',
        direccion: cliente.empresa?.direccion || ''
      });
    }

    this.selectedClienteId = cliente.idCliente;
    this.aplicarValidacionesPorTipo();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.mostrarErrores = false;
    this.clienteForm.reset({ tipo_cliente: 'normal', estado: true });
  }

  openConfirmModal(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.isConfirmModalOpen = true;
  }

  confirm(): void {
    if (this.isProcessing) return;

    if (this.confirmAction) {
      this.confirmAction();
    }
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.confirmMessage = '';
    this.confirmTitle = '';
    this.confirmAction = null;
  }

  // Paginación
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadClientes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadClientes();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.loadClientes();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  searchCategories(): void {
    this.currentPage = 1;

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.searchTerm = '';
      this.loadClientes();
    } else {
      this.loadClientes();
    }
  }

  // Método helper para obtener mensajes de error específicos
  getErrorMessage(controlName: string): string {
    const control = this.clienteForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Ingrese un correo electrónico válido';
    if (errors['ciInvalido']) return 'CI inválido. Formato: 1234567 LP (con o sin departamento)';
    if (errors['nitInvalido']) return 'NIT inválido. Debe tener entre 7 y 12 dígitos';
    if (errors['telefonoInvalido']) return 'Teléfono inválido. Celular: 6xxxxxxx o 7xxxxxxx, Fijo: 2xxxxxxx';
    if (errors['telefonoEmpresaInvalido']) return 'Teléfono inválido. Celular: 6xxxxxxx o 7xxxxxxx, Fijo: 2xxxxxxx';
    if (errors['nombreInvalido']) return 'Solo se permiten letras, espacios y tildes';
    if (errors['nombreMuyCorto']) return 'Debe tener al menos 2 caracteres';
    if (errors['razonSocialMuyCorta']) return 'Debe tener al menos 3 caracteres';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  cambiarTipoCliente(cliente: any): void {
    if (this.isProcessing) return;

    const nuevoTipo = cliente.tipoCliente === 'normal' ? 'destacado' : 'normal';
    const accion = nuevoTipo === 'destacado' ? 'MARCAR COMO DESTACADO' : 'MARCAR COMO NORMAL';
    const mensaje = `¿Estás seguro de ${nuevoTipo === 'destacado' ? 'marcar como destacado' : 'marcar como normal'} al cliente "${this.getNombreCliente(cliente)}"?`;

    this.openConfirmModal(accion, mensaje, () => {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.clientService.cambiarTipoCliente(cliente.idCliente, nuevoTipo).pipe(
        finalize(() => this.isProcessing = false)
      ).subscribe({
        next: () => {
          this.notificationService.success(
            `Cliente marcado como ${nuevoTipo === 'destacado' ? 'destacado' : 'normal'} correctamente`
          );
          this.loadClientes();
          this.closeConfirmModal();
        },
        error: (err) => {
          console.error('Error al cambiar tipo de cliente:', err);
          this.notificationService.error('Error al cambiar tipo de cliente');
        }
      });
    });
  }

  getNombreCliente(cliente: any): string {
    if (cliente.tipoClientePersonaEmpresa === 'Persona') {
      return `${cliente.persona?.name_people} ${cliente.persona?.ap} ${cliente.persona?.am || ''}`.trim();
    } else {
      return cliente.empresa?.razonSocial || 'Cliente';
    }
  }

}
