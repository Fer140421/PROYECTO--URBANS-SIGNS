import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PortalAuthService } from '../../Core/portal-auth.service';
import { PortalDataService } from '../../Core/Service/Portal/portal-data.service';
import { HeaderLanding } from '../../Core/Layout/landing-page/header-landing/header-landing';
import { PublicService, Quote, QuoteItem } from '../../Core/Models/client-portal.model';

export interface FormTrabajoItem {
  idTrabajo?: number;
  servicio: string;
  cantidad: number;
  base: number;
  altura: number;
  descripcion: string;
  material?: string;
  file?: File | null;
  imagePreview?: string | null;
  archivoReferencia?: string;
}

@Component({
  selector: 'app-portal',
  imports: [CommonModule, FormsModule, HeaderLanding, RouterLink],
  templateUrl: './portal.html'
})
export class Portal implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(PortalAuthService);
  readonly data = inject(PortalDataService);
  readonly user = this.auth.currentUser;

  readonly view = signal<'profile' | 'quotes' | 'orders' | string>('profile');
  private routeSub?: Subscription;

  // Catálogo de servicios dinámicos
  readonly catalogoServicios = signal<PublicService[]>([]);
  readonly serviciosNombres = signal<string[]>([
    'Letreros luminosos',
    'Impresión digital',
    'Rotulación vehicular',
    'Señalización',
    'BTL y eventos'
  ]);

  // Filtros de búsqueda
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'review' | 'quoted' | 'accepted' | 'closed'>('all');

  // Lista filtrada
  readonly filteredQuotes = computed(() => {
    const list = this.data.quotes();
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.statusFilter();

    return list.filter(q => {
      const matchesQuery = !query ||
        (q.id && q.id.toLowerCase().includes(query)) ||
        (q.title && q.title.toLowerCase().includes(query)) ||
        (q.service && q.service.toLowerCase().includes(query));

      if (!matchesQuery) return false;

      if (filter === 'review') {
        return q.status === 'review' || q.status === 'pending' || q.status === 'draft';
      }
      if (filter === 'quoted') {
        return q.status === 'quoted';
      }
      if (filter === 'accepted') {
        return q.status === 'accepted';
      }
      if (filter === 'closed') {
        return q.status === 'expired' || q.status === 'cancelled' || q.status === 'rejected';
      }
      return true;
    });
  });

  // Conteo por estado para los tabs
  readonly countReview = computed(() =>
    this.data.quotes().filter(q => q.status === 'review' || q.status === 'pending' || q.status === 'draft').length
  );
  readonly countQuoted = computed(() =>
    this.data.quotes().filter(q => q.status === 'quoted').length
  );
  readonly countAccepted = computed(() =>
    this.data.quotes().filter(q => q.status === 'accepted').length
  );
  readonly countClosed = computed(() =>
    this.data.quotes().filter(q => q.status === 'expired' || q.status === 'cancelled' || q.status === 'rejected').length
  );

  // Estado del detalle de cotización
  readonly selectedQuote = signal<Quote | null>(null);
  readonly isDetailModalOpen = signal<boolean>(false);
  readonly isActionLoading = signal<boolean>(false);
  readonly actionFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de aprobación formal de cotización
  readonly approvingQuote = signal<Quote | null>(null);
  readonly isApprovalModalOpen = signal<boolean>(false);

  // Modal de confirmación para acciones críticas (cancelar, rechazar)
  readonly confirmModal = signal<{
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    type?: 'danger' | 'warning';
    action: () => void;
  } | null>(null);

  closeConfirmModal(): void {
    this.confirmModal.set(null);
  }

  onExecuteModalConfirm(): void {
    const data = this.confirmModal();
    if (data) {
      const action = data.action;
      this.closeConfirmModal();
      action();
    }
  }

  // ==========================================
  // MODAL DE REGISTRO (CREAR SOLICITUD)
  // ==========================================
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);
  readonly createError = signal<string>('');
  createForm = {
    title: '',
    notes: ''
  };
  createTrabajos = signal<FormTrabajoItem[]>([]);
  createSelectedFile: File | null = null;
  createImagePreview: string | null = null;

  // ==========================================
  // MODAL DE EDICIÓN (MODIFICAR SOLICITUD)
  // ==========================================
  readonly isEditModalOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editError = signal<string>('');
  readonly editingQuote = signal<Quote | null>(null);
  editForm = {
    title: '',
    notes: ''
  };
  editTrabajos = signal<FormTrabajoItem[]>([]);
  editSelectedFile: File | null = null;
  editImagePreview: string | null = null;

  ngOnInit(): void {
    this.cargarCatalogo();

    this.routeSub = this.route.data.subscribe(data => {
      const currentView = data['view'] ?? 'profile';
      this.view.set(currentView);
      if (currentView === 'quotes') {
        this.data.loadQuotes().subscribe();
      } else if (currentView === 'orders') {
        this.data.loadOrders().subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private cargarCatalogo(): void {
    this.data.getPublicServices().subscribe({
      next: (servicios) => {
        if (servicios && servicios.length > 0) {
          this.catalogoServicios.set(servicios);
          this.serviciosNombres.set(servicios.map(s => s.nombre));
        }
      },
      error: () => {
        // En caso de que falle la carga remota, se mantienen los nombres por defecto
      }
    });
  }

  // ==========================================
  // DETALLE
  // ==========================================
  openQuoteDetail(quote: Quote): void {
    this.selectedQuote.set(quote);
    this.isDetailModalOpen.set(true);
    this.actionFeedback.set(null);
  }

  closeQuoteDetail(): void {
    this.isDetailModalOpen.set(false);
    this.selectedQuote.set(null);
    this.actionFeedback.set(null);
  }

  // ==========================================
  // FLUJO DE CREAR SOLICITUD
  // ==========================================
  openCreateModal(): void {
    this.createForm = { title: '', notes: '' };
    const primerServicio = this.serviciosNombres()[0] || 'Letreros luminosos';
    const catalogo = this.catalogoServicios();
    const idSrv = catalogo.length > 0 ? catalogo[0].idTrabajo : undefined;

    this.createTrabajos.set([
      {
        idTrabajo: idSrv,
        servicio: primerServicio,
        cantidad: 1,
        base: 2.0,
        altura: 1.0,
        descripcion: '',
        material: ''
      }
    ]);
    this.createSelectedFile = null;
    this.createImagePreview = null;
    this.createError.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.createError.set('');
    this.createSelectedFile = null;
    this.createImagePreview = null;
  }

  addCreateTrabajo(): void {
    const primerServicio = this.serviciosNombres()[0] || 'Letreros luminosos';
    const catalogo = this.catalogoServicios();
    const idSrv = catalogo.length > 0 ? catalogo[0].idTrabajo : undefined;

    this.createTrabajos.update(items => [
      ...items,
      {
        idTrabajo: idSrv,
        servicio: primerServicio,
        cantidad: 1,
        base: 1.5,
        altura: 1.0,
        descripcion: '',
        material: ''
      }
    ]);
  }

  removeCreateTrabajo(index: number): void {
    if (this.createTrabajos().length <= 1) return;
    this.createTrabajos.update(items => items.filter((_, i) => i !== index));
  }

  onServiceChange(item: FormTrabajoItem): void {
    const srv = this.catalogoServicios().find(s => s.nombre.toLowerCase() === item.servicio.toLowerCase());
    if (srv) {
      item.idTrabajo = srv.idTrabajo;
    }
  }

  onCreateFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFileForCreate(input.files[0]);
    }
  }

  removeCreateFile(): void {
    this.createSelectedFile = null;
    this.createImagePreview = null;
  }

  onCreateTrabajoFileSelected(event: Event, item: FormTrabajoItem): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFileForTrabajo(input.files[0], item, this.createError);
    }
  }

  removeCreateTrabajoFile(item: FormTrabajoItem): void {
    item.file = null;
    item.imagePreview = null;
    item.archivoReferencia = undefined;
  }

  private processFileForTrabajo(file: File, item: FormTrabajoItem, errorSignal: any): void {
    errorSignal.set('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      errorSignal.set('Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorSignal.set('La imagen no debe superar los 5 MB.');
      return;
    }
    item.file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      item.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private processFileForCreate(file: File): void {
    this.createError.set('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.createError.set('Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.createError.set('La imagen no debe superar los 5 MB.');
      return;
    }
    this.createSelectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.createImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  submitCreate(): void {
    this.createError.set('');
    if (!this.createForm.title.trim()) {
      this.createError.set('Por favor ingresa un título o nombre para el proyecto.');
      return;
    }
    const items = this.createTrabajos();
    if (items.length === 0) {
      this.createError.set('Debes agregar al menos un trabajo a cotizar.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.base || it.base <= 0 || !it.altura || it.altura <= 0) {
        this.createError.set(`Ingresa medidas de base y altura válidas para el Trabajo #${i + 1}.`);
        return;
      }
      if (!it.cantidad || it.cantidad < 1) {
        this.createError.set(`La cantidad mínima es 1 para el Trabajo #${i + 1}.`);
        return;
      }
    }

    this.isCreating.set(true);
    this.data.createQuote({
      title: this.createForm.title.trim(),
      service: items[0]?.servicio,
      notes: this.createForm.notes.trim(),
      trabajos: items.map(t => ({
        idTrabajo: t.idTrabajo,
        servicio: t.servicio,
        cantidad: Number(t.cantidad) || 1,
        base: Number(t.base) || 0,
        altura: Number(t.altura) || 0,
        descripcion: t.descripcion || '',
        material: t.material ? t.material.trim() : '',
        file: t.file,
        archivoReferencia: t.archivoReferencia
      }))
    }, this.createSelectedFile).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.closeCreateModal();
        this.actionFeedback.set({
          type: 'success',
          message: '¡Solicitud registrada con éxito! Ha ingresado a revisión técnica en nuestro taller.'
        });
        this.data.loadQuotes().subscribe();
      },
      error: () => {
        this.isCreating.set(false);
        this.createError.set('No pudimos enviar tu solicitud en este momento. Inténtalo de nuevo.');
      }
    });
  }

  // ==========================================
  // FLUJO DE EDITAR SOLICITUD
  // ==========================================
  openEditModal(quote: Quote): void {
    this.editingQuote.set(quote);
    this.editForm = {
      title: quote.title || '',
      notes: quote.notes || ''
    };

    // Pre-cargar trabajos existentes o inicializar con 1
    if (quote.items && quote.items.length > 0) {
      this.editTrabajos.set(quote.items.map(it => ({
        idTrabajo: it.idTrabajo,
        servicio: it.service || 'Letreros luminosos',
        cantidad: it.quantity || 1,
        base: it.base || 1.0,
        altura: it.altura || 1.0,
        descripcion: it.description || '',
        material: it.material || '',
        archivoReferencia: it.referenceImage,
        imagePreview: it.referenceImage || null,
        file: null
      })));
    } else {
      const primerServicio = this.serviciosNombres()[0] || 'Letreros luminosos';
      this.editTrabajos.set([
        {
          servicio: primerServicio,
          cantidad: 1,
          base: 2.0,
          altura: 1.0,
          descripcion: '',
          material: ''
        }
      ]);
    }

    this.editSelectedFile = null;
    this.editImagePreview = quote.referenceImage || null;
    this.editError.set('');
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.editingQuote.set(null);
    this.editError.set('');
    this.editSelectedFile = null;
    this.editImagePreview = null;
  }

  addEditTrabajo(): void {
    const primerServicio = this.serviciosNombres()[0] || 'Letreros luminosos';
    const catalogo = this.catalogoServicios();
    const idSrv = catalogo.length > 0 ? catalogo[0].idTrabajo : undefined;

    this.editTrabajos.update(items => [
      ...items,
      {
        idTrabajo: idSrv,
        servicio: primerServicio,
        cantidad: 1,
        base: 1.5,
        altura: 1.0,
        descripcion: '',
        material: ''
      }
    ]);
  }

  removeEditTrabajo(index: number): void {
    if (this.editTrabajos().length <= 1) return;
    this.editTrabajos.update(items => items.filter((_, i) => i !== index));
  }

  onEditTrabajoFileSelected(event: Event, item: FormTrabajoItem): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFileForTrabajo(input.files[0], item, this.editError);
    }
  }

  removeEditTrabajoFile(item: FormTrabajoItem): void {
    item.file = null;
    item.imagePreview = null;
    item.archivoReferencia = undefined;
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFileForEdit(input.files[0]);
    }
  }

  removeEditFile(): void {
    this.editSelectedFile = null;
    this.editImagePreview = null;
  }

  private processFileForEdit(file: File): void {
    this.editError.set('');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.editError.set('Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.editError.set('La imagen no debe superar los 5 MB.');
      return;
    }
    this.editSelectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  submitEdit(): void {
    const quote = this.editingQuote();
    if (!quote) return;

    this.editError.set('');
    if (!this.editForm.title.trim()) {
      this.editError.set('Por favor ingresa un título o nombre para el proyecto.');
      return;
    }
    const items = this.editTrabajos();
    if (items.length === 0) {
      this.editError.set('Debes mantener al menos un trabajo en la solicitud.');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.base || it.base <= 0 || !it.altura || it.altura <= 0) {
        this.editError.set(`Ingresa medidas de base y altura válidas para el Trabajo #${i + 1}.`);
        return;
      }
      if (!it.cantidad || it.cantidad < 1) {
        this.editError.set(`La cantidad mínima es 1 para el Trabajo #${i + 1}.`);
        return;
      }
    }

    const targetId = quote.idSolicitud || quote.numericId;
    this.isEditing.set(true);

    this.data.updateQuote(targetId, {
      title: this.editForm.title.trim(),
      service: items[0]?.servicio,
      notes: this.editForm.notes.trim(),
      trabajos: items.map(t => ({
        idTrabajo: t.idTrabajo,
        servicio: t.servicio,
        cantidad: Number(t.cantidad) || 1,
        base: Number(t.base) || 0,
        altura: Number(t.altura) || 0,
        descripcion: t.descripcion || '',
        material: t.material ? t.material.trim() : '',
        file: t.file,
        archivoReferencia: t.archivoReferencia
      }))
    }, this.editSelectedFile).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.closeEditModal();
        this.actionFeedback.set({
          type: 'success',
          message: `¡Solicitud ${quote.id} actualizada correctamente!`
        });
        // Refrescar lista y actualizar selectedQuote si estaba abierto
        this.data.loadQuotes().subscribe(updatedList => {
          const match = updatedList.find(q => (q.idSolicitud || q.numericId) === targetId);
          if (match && this.selectedQuote() && (this.selectedQuote()!.idSolicitud || this.selectedQuote()!.numericId) === targetId) {
            this.selectedQuote.set(match);
          }
        });
      },
      error: (err) => {
        this.isEditing.set(false);
        const msg = err.status === 409
          ? 'No se puede editar esta solicitud porque ya fue cotizada, aprobada o cancelada.'
          : 'No se pudieron guardar los cambios. Inténtalo de nuevo.';
        this.editError.set(msg);
      }
    });
  }

  // ==========================================
  // CANCELAR SOLICITUD / COTIZACIÓN
  // ==========================================
  cancelQuote(quote: Quote): void {
    if (this.isActionLoading()) return;
    const confirmMsg = `¿Confirmas que deseas cancelar la solicitud "${quote.id} - ${quote.title}"?\n\nAl cancelarla, no se podrá proceder con este trabajo y no avanzará al flujo de producción.`;

    this.confirmModal.set({
      title: 'Cancelar solicitud',
      message: confirmMsg,
      confirmText: 'Sí, cancelar solicitud',
      cancelText: 'Volver',
      type: 'danger',
      action: () => this.executeCancelQuote(quote)
    });
  }

  private executeCancelQuote(quote: Quote): void {
    this.isActionLoading.set(true);
    this.actionFeedback.set(null);

    const targetId = quote.idSolicitud || quote.numericId;
    this.data.cancelQuote(targetId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        const updated: Quote = {
          ...quote,
          status: 'cancelled',
          editable: false,
          cancelable: false
        };
        this.actionFeedback.set({
          type: 'success',
          message: `Has cancelado la solicitud ${quote.id}. Su estado ahora es Cancelada.`
        });
        if (this.selectedQuote() && (this.selectedQuote()!.idSolicitud || this.selectedQuote()!.numericId) === targetId) {
          this.selectedQuote.set(updated);
        }
        this.data.quotes.update(list => list.map(q =>
          (q.idSolicitud || q.numericId) === targetId ? updated : q
        ));
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err.status === 409
          ? 'No se puede cancelar una solicitud cuya cotización ya ha sido aprobada.'
          : 'No se pudo cancelar la solicitud en este momento. Inténtalo nuevamente.';
        this.actionFeedback.set({ type: 'error', message: msg });
      }
    });
  }

  // ==========================================
  // APROBACIÓN FORMAL Y RECHAZO DE COTIZACIÓN
  // ==========================================
  openApprovalModal(quote: Quote): void {
    this.approvingQuote.set(quote);
    this.isApprovalModalOpen.set(true);
    this.actionFeedback.set(null);
  }

  closeApprovalModal(): void {
    if (this.isActionLoading()) return;
    this.isApprovalModalOpen.set(false);
    this.approvingQuote.set(null);
  }

  confirmApproveQuote(): void {
    const quote = this.approvingQuote();
    if (!quote) return;
    this.acceptQuote(quote, true);
  }

  acceptQuote(quote: Quote, fromApprovalModal = false): void {
    if (this.isActionLoading()) return;
    this.isActionLoading.set(true);
    this.actionFeedback.set(null);

    const targetId = quote.idCotizacion || quote.numericId;

    this.data.acceptQuote(targetId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        if (fromApprovalModal) {
          this.closeApprovalModal();
        }
        this.actionFeedback.set({
          type: 'success',
          message: `¡Excelente! Has aprobado la cotización ${quote.id}. Nuestro equipo técnico y de taller iniciará la coordinación de producción.`
        });
        const updated: Quote = {
          ...quote,
          status: 'accepted',
          editable: false,
          cancelable: false
        };
        if (this.selectedQuote() && ((this.selectedQuote()!.idCotizacion && this.selectedQuote()!.idCotizacion === quote.idCotizacion) || this.selectedQuote()!.numericId === quote.numericId)) {
          this.selectedQuote.set(updated);
        }
        this.data.quotes.update(list => list.map(q =>
          (q.idCotizacion && q.idCotizacion === quote.idCotizacion) || q.numericId === quote.numericId ? updated : q
        ));
      },
      error: (err) => {
        this.isActionLoading.set(false);
        let msg = 'No se pudo procesar la aprobación en este momento.';
        if (err.status === 409) {
          msg = 'Esta cotización ya fue procesada anteriormente.';
        } else if (err.status === 400 && err.error?.message?.includes('caducad')) {
          msg = 'Esta cotización superó su vigencia de 15 días y ha caducado. No puede ser aceptada.';
          const updated: Quote = { ...quote, status: 'expired', editable: false, cancelable: false };
          if (this.selectedQuote()) this.selectedQuote.set(updated);
          this.data.quotes.update(list => list.map(q => q.numericId === quote.numericId ? updated : q));
        }
        this.actionFeedback.set({ type: 'error', message: msg });
      }
    });
  }

  rejectQuote(quote: Quote): void {
    if (this.isActionLoading()) return;

    this.confirmModal.set({
      title: 'Rechazar cotización',
      message: '¿Confirmas que deseas rechazar esta cotización formal? Esta acción notificará al equipo y no se podrá deshacer.',
      confirmText: 'Rechazar cotización',
      cancelText: 'Volver',
      type: 'danger',
      action: () => this.executeRejectQuote(quote)
    });
  }

  private executeRejectQuote(quote: Quote): void {
    this.isActionLoading.set(true);
    this.actionFeedback.set(null);

    this.data.rejectQuote(quote.numericId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.actionFeedback.set({
          type: 'success',
          message: 'Has rechazado esta cotización formal.'
        });
        const updated: Quote = {
          ...quote,
          status: 'rejected',
          editable: false,
          cancelable: false
        };
        this.selectedQuote.set(updated);
        this.data.quotes.update(list => list.map(q => q.numericId === quote.numericId ? updated : q));
      },
      error: () => {
        this.isActionLoading.set(false);
        this.actionFeedback.set({
          type: 'error',
          message: 'No se pudo rechazar la cotización en este momento.'
        });
      }
    });
  }

  // ==========================================
  // HELPERS DE UI
  // ==========================================
  getWhatsAppLink(quote: Quote): string {
    const text = encodeURIComponent(`Hola Urban Signs, tengo una consulta sobre mi solicitud/cotización ${quote.id} (${quote.title}).`);
    return `https://wa.me/59141234567?text=${text}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'quoted': return 'Cotizada / Lista para aprobar';
      case 'accepted': return 'Aprobada';
      case 'expired': return 'Caducada';
      case 'cancelled': return 'Cancelada';
      case 'rejected': return 'Rechazada';
      case 'review': return 'En revisión';
      case 'pending': return 'Pendiente';
      default: return 'En proceso';
    }
  }

  calculateTotalArea(items: FormTrabajoItem[]): string {
    const total = items.reduce((acc, it) => acc + ((it.base || 0) * (it.altura || 0) * (it.cantidad || 1)), 0);
    return total.toFixed(2);
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/landing/home']));
  }
}
