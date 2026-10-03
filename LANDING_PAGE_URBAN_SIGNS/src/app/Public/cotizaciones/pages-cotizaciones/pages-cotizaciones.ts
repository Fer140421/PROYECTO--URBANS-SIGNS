import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PortalAuthService } from '../../../Core/portal-auth.service';
import { PortalDataService } from '../../../Core/Service/Portal/portal-data.service';
import { PublicService } from '../../../Core/Models/client-portal.model';

export interface FormTrabajoItem {
  idTrabajo?: number;
  servicio: string;
  cantidad: number;
  base: number;
  altura: number;
  descripcion: string;
  file?: File | null;
  imagePreview?: string | null;
  isDragging?: boolean;
}

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

  form = {
    title: '',
    notes: ''
  };

  trabajos: FormTrabajoItem[] = [
    {
      idTrabajo: undefined,
      servicio: 'Letreros luminosos',
      cantidad: 1,
      base: 2.0,
      altura: 1.0,
      descripcion: '',
      file: null,
      imagePreview: null,
      isDragging: false
    }
  ];

  catalogoServicios: PublicService[] = [];
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
          this.catalogoServicios = servicios;
          const nombres = servicios.map(s => s.nombre);
          this.serviciosDisponibles = nombres;

          // Asignar idTrabajo al primer trabajo si coincide
          this.vincularIdsTrabajo();
        }
      }
    });

    // Detectar si viene con un servicio preseleccionado desde la landing
    this.route.queryParams.subscribe(params => {
      if (params['servicio']) {
        const servParam = params['servicio'];
        if (this.trabajos.length > 0) {
          this.trabajos[0].servicio = servParam;
        }
        if (!this.form.title) {
          this.form.title = `Cotización de ${servParam}`;
        }
        if (!this.serviciosDisponibles.includes(servParam)) {
          this.serviciosDisponibles.unshift(servParam);
        }
        this.vincularIdsTrabajo();
      }
    });
  }

  agregarTrabajo(): void {
    const primerServicio = this.serviciosDisponibles[0] || 'Letreros luminosos';
    const item: FormTrabajoItem = {
      idTrabajo: this.buscarIdPorNombre(primerServicio),
      servicio: primerServicio,
      cantidad: 1,
      base: 1.5,
      altura: 1.0,
      descripcion: '',
      file: null,
      imagePreview: null,
      isDragging: false
    };
    this.trabajos.push(item);
  }

  removerTrabajo(index: number): void {
    if (this.trabajos.length > 1) {
      this.trabajos.splice(index, 1);
    }
  }

  onServicioChange(trabajo: FormTrabajoItem): void {
    trabajo.idTrabajo = this.buscarIdPorNombre(trabajo.servicio);
  }

  calcularArea(trabajo: FormTrabajoItem): number {
    const b = Number(trabajo.base) || 0;
    const h = Number(trabajo.altura) || 0;
    return Number((b * h).toFixed(2));
  }

  calcularAreaTotalGeneral(): number {
    return this.trabajos.reduce((total, t) => {
      const area = this.calcularArea(t);
      const cant = Number(t.cantidad) || 1;
      return total + (area * cant);
    }, 0);
  }

  private vincularIdsTrabajo(): void {
    for (const t of this.trabajos) {
      if (!t.idTrabajo) {
        t.idTrabajo = this.buscarIdPorNombre(t.servicio);
      }
    }
  }

  private buscarIdPorNombre(nombre: string): number | undefined {
    const found = this.catalogoServicios.find(
      s => s.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()
    );
    return found ? found.idTrabajo : undefined;
  }

  onTrabajoFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFileForTrabajo(input.files[0], index);
    }
  }

  onTrabajoDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.trabajos[index]) {
      this.trabajos[index].isDragging = true;
    }
  }

  onTrabajoDragLeave(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.trabajos[index]) {
      this.trabajos[index].isDragging = false;
    }
  }

  onTrabajoFileDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.trabajos[index]) {
      this.trabajos[index].isDragging = false;
      if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        this.processFileForTrabajo(event.dataTransfer.files[0], index);
      }
    }
  }

  processFileForTrabajo(file: File, index: number): void {
    this.submitError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.submitError = `Trabajo #${index + 1}: Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.`;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.submitError = `Trabajo #${index + 1}: La imagen no debe superar los 5 MB.`;
      return;
    }

    const t = this.trabajos[index];
    if (t) {
      t.file = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        t.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeTrabajoFile(index: number): void {
    const t = this.trabajos[index];
    if (t) {
      t.file = null;
      t.imagePreview = null;
    }
  }

  submit(): void {
    this.submitError = '';
    if (!this.auth.isAuthenticated()) {
      this.submitError = 'Inicia sesión para enviar tu solicitud de cotización.';
      return;
    }
    if (!this.form.title.trim()) {
      this.submitError = 'Por favor ingresa un título o nombre para tu proyecto.';
      return;
    }
    if (this.trabajos.length === 0) {
      this.submitError = 'Debes agregar al menos un trabajo a cotizar.';
      return;
    }

    for (let i = 0; i < this.trabajos.length; i++) {
      const t = this.trabajos[i];
      if (!t.servicio) {
        this.submitError = `Selecciona el tipo de trabajo para el Trabajo #${i + 1}.`;
        return;
      }
      if (!t.base || t.base <= 0) {
        this.submitError = `Ingresa una medida de base válida en metros para el Trabajo #${i + 1}.`;
        return;
      }
      if (!t.altura || t.altura <= 0) {
        this.submitError = `Ingresa una medida de altura válida en metros para el Trabajo #${i + 1}.`;
        return;
      }
      if (!t.cantidad || t.cantidad < 1) {
        this.submitError = `La cantidad mínima es 1 para el Trabajo #${i + 1}.`;
        return;
      }
    }

    this.isSubmitting = true;
    this.portal.createQuote({
      title: this.form.title,
      service: this.trabajos[0]?.servicio,
      notes: this.form.notes,
      trabajos: this.trabajos.map(t => ({
        idTrabajo: t.idTrabajo,
        servicio: t.servicio,
        cantidad: Number(t.cantidad) || 1,
        base: Number(t.base) || 0,
        altura: Number(t.altura) || 0,
        descripcion: t.descripcion || '',
        file: t.file
      }))
    }).subscribe({
      next: () => {
        this.submitted = true;
        this.isSubmitting = false;
      },
      error: () => {
        this.submitError = 'No pudimos enviar tu solicitud. Inténtalo nuevamente.';
        this.isSubmitting = false;
      }
    });
  }

}
