import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortalAuthService } from '../../../Core/portal-auth.service';
import { PortalDataService } from '../../../Core/Service/Portal/portal-data.service';

@Component({
  selector: 'app-pages-cotizaciones',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pages-cotizaciones.html',
  styleUrl: './pages-cotizaciones.css',
})
export class PagesCotizaciones implements OnInit {
  private readonly auth = inject(PortalAuthService);
  private readonly portal = inject(PortalDataService);
  private readonly route = inject(ActivatedRoute);

  readonly currentUser = this.auth.currentUser;
  submitted = false;
  submitError = '';
  isSubmitting = false;
  form = { title: '', service: 'Letreros luminosos', quantity: 1, dimensions: '', notes: '' };
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragging = false;

  serviciosDisponibles: string[] = [
    'Letreros luminosos',
    'Impresión digital',
    'Rotulación vehicular',
    'Señalización',
    'BTL y eventos'
  ];

  ngOnInit(): void {
    this.auth.restoreSession().subscribe();

    // Cargar servicios dinámicos del catálogo
    this.portal.getPublicServices().subscribe({
      next: (servicios) => {
        if (servicios && servicios.length > 0) {
          const nombres = servicios.map(s => s.nombre);
          // Si el servicio actual no está, mantenerlo al inicio
          if (this.form.service && !nombres.includes(this.form.service)) {
            this.serviciosDisponibles = [this.form.service, ...nombres];
          } else {
            this.serviciosDisponibles = nombres;
          }
        }
      }
    });

    // Detectar si viene con un servicio preseleccionado desde la landing
    this.route.queryParams.subscribe(params => {
      if (params['servicio']) {
        const servParam = params['servicio'];
        this.form.service = servParam;
        if (!this.form.title) {
          this.form.title = `Cotización de ${servParam}`;
        }
        if (!this.serviciosDisponibles.includes(servParam)) {
          this.serviciosDisponibles.unshift(servParam);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File): void {
    this.submitError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.submitError = 'Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.submitError = 'La imagen no debe superar los 5 MB.';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  submit(): void {
    this.submitError = '';
    if (!this.auth.isAuthenticated()) {
      this.submitError = 'Inicia sesión para enviar tu solicitud de cotización.';
      return;
    }
    if (!this.form.title.trim() || !this.form.dimensions.trim()) return;
    this.isSubmitting = true;
    this.portal.createQuote({
      title: this.form.title,
      service: this.form.service,
      notes: this.form.notes,
      items: [{ service: this.form.service, description: this.form.title, quantity: this.form.quantity, dimensions: this.form.dimensions }]
    }, this.selectedFile).subscribe({
      next: () => { this.submitted = true; this.isSubmitting = false; },
      error: () => { this.submitError = 'No pudimos enviar tu solicitud. Inténtalo nuevamente.'; this.isSubmitting = false; }
    });
  }

}
