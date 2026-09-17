import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  readonly currentUser = this.auth.currentUser;
  submitted = false;
  submitError = '';
  isSubmitting = false;
  form = { title: '', service: 'Letreros luminosos', quantity: 1, dimensions: '', notes: '' };

  ngOnInit(): void {
    this.auth.restoreSession().subscribe();
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
    }).subscribe({
      next: () => { this.submitted = true; this.isSubmitting = false; },
      error: () => { this.submitError = 'No pudimos enviar tu solicitud. Inténtalo nuevamente.'; this.isSubmitting = false; }
    });
  }

}
