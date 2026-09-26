import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PortalAuthService } from '../../Core/portal-auth.service';
import { PortalDataService } from '../../Core/Service/Portal/portal-data.service';
import { HeaderLanding } from '../../Core/Layout/landing-page/header-landing/header-landing';
import { Quote } from '../../Core/Models/client-portal.model';

@Component({
  selector: 'app-portal',
  imports: [CommonModule, HeaderLanding, RouterLink],
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

  // Estado del detalle de cotización
  readonly selectedQuote = signal<Quote | null>(null);
  readonly isDetailModalOpen = signal<boolean>(false);
  readonly isActionLoading = signal<boolean>(false);
  readonly actionFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  ngOnInit(): void {
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

  acceptQuote(quote: Quote): void {
    if (this.isActionLoading()) return;
    this.isActionLoading.set(true);
    this.actionFeedback.set(null);

    this.data.acceptQuote(quote.numericId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.actionFeedback.set({
          type: 'success',
          message: '¡Excelente! Has aprobado esta cotización. Nuestro equipo coordinará los detalles para iniciar la producción.'
        });
        const updated: Quote = { ...quote, status: 'accepted' };
        this.selectedQuote.set(updated);
        this.data.quotes.update(list => list.map(q => q.numericId === quote.numericId ? updated : q));
      },
      error: (err) => {
        this.isActionLoading.set(false);
        const msg = err.status === 409
          ? 'Esta cotización ya fue procesada anteriormente.'
          : 'No se pudo procesar la aprobación en este momento. Inténtalo de nuevo.';
        this.actionFeedback.set({ type: 'error', message: msg });
      }
    });
  }

  rejectQuote(quote: Quote): void {
    if (this.isActionLoading()) return;
    if (!confirm('¿Confirmas que deseas rechazar esta cotización?')) return;

    this.isActionLoading.set(true);
    this.actionFeedback.set(null);

    this.data.rejectQuote(quote.numericId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.actionFeedback.set({
          type: 'success',
          message: 'Has rechazado esta cotización.'
        });
        const updated: Quote = { ...quote, status: 'rejected' };
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

  getWhatsAppLink(quote: Quote): string {
    const text = encodeURIComponent(`Hola Urban Signs, tengo una consulta sobre mi cotización ${quote.id} (${quote.title}).`);
    return `https://wa.me/59141234567?text=${text}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'quoted': return 'Cotizada / Lista';
      case 'accepted': return 'Aprobada';
      case 'rejected': return 'Caducada';
      case 'review': return 'En revisión';
      default: return 'Pendiente';
    }
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/landing/home']));
  }
}
