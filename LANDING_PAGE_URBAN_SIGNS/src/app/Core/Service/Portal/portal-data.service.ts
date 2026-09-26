import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, map, tap } from 'rxjs';
import { ClientOrder, PublicService, Quote } from '../../Models/client-portal.model';
import { API_URL } from '../../config/api.config';

/** Datos del portal obtenidos exclusivamente para el cliente de la cookie actual. */
@Injectable({ providedIn: 'root' })
export class PortalDataService {
  private readonly http = inject(HttpClient);

  readonly quotes = signal<Quote[]>([]);
  readonly orders = signal<ClientOrder[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  getPublicServices(): Observable<PublicService[]> {
    return this.http.get<PublicService[]>(`${API_URL}/portal/servicios`);
  }

  loadQuotes(): Observable<Quote[]> {
    this.isLoading.set(true);
    this.error.set('');
    return this.http.get<PortalQuoteDto[]>(`${API_URL}/portal/cotizaciones`, { withCredentials: true }).pipe(
      map(quotes => quotes.map(quote => this.toQuote(quote))),
      tap({
        next: quotes => { this.quotes.set(quotes); this.isLoading.set(false); },
        error: () => { this.error.set('No pudimos cargar tus cotizaciones.'); this.isLoading.set(false); }
      }),
      catchError(() => EMPTY)
    );
  }

  loadOrders(): Observable<ClientOrder[]> {
    this.isLoading.set(true);
    this.error.set('');
    return this.http.get<PortalOrderDto[]>(`${API_URL}/portal/pedidos`, { withCredentials: true }).pipe(
      map(orders => orders.map(order => this.toOrder(order))),
      tap({
        next: orders => { this.orders.set(orders); this.isLoading.set(false); },
        error: () => { this.error.set('No pudimos cargar tus pedidos.'); this.isLoading.set(false); }
      }),
      catchError(() => EMPTY)
    );
  }

  getQuote(id: number): Observable<Quote> {
    return this.http.get<PortalQuoteDto>(`${API_URL}/portal/cotizaciones/${id}`, { withCredentials: true }).pipe(
      map(quote => this.toQuote(quote))
    );
  }

  acceptQuote(id: number): Observable<void> {
    return this.http.post<void>(`${API_URL}/portal/cotizaciones/${id}/aceptar`, {}, { withCredentials: true });
  }

  rejectQuote(id: number): Observable<void> {
    return this.http.post<void>(`${API_URL}/portal/cotizaciones/${id}/rechazar`, {}, { withCredentials: true });
  }

  getOrder(id: number): Observable<ClientOrder> {
    return this.http.get<PortalOrderDto>(`${API_URL}/portal/pedidos/${id}`, { withCredentials: true }).pipe(
      map(order => this.toOrder(order))
    );
  }

  createQuote(
    payload: { title: string; service: string; items: Quote['items']; notes: string },
    file?: File | null
  ): Observable<void> {
    const details = [
      payload.title,
      `Servicio solicitado: ${payload.service}.`,
      ...payload.items.map(item => `${item.quantity} × ${item.description} (${item.dimensions}).`),
      payload.notes
    ].filter(Boolean).join('\n');

    if (file) {
      const formData = new FormData();
      formData.append('observaciones', details);
      formData.append('file', file);
      return this.http.post<void>(`${API_URL}/portal/solicitudes`, formData, { withCredentials: true });
    }

    return this.http.post<void>(`${API_URL}/portal/solicitudes`, {
      observaciones: details
    }, { withCredentials: true });
  }

  private toQuote(quote: PortalQuoteDto): Quote {
    return {
      id: quote.codigo,
      title: quote.titulo,
      service: quote.servicio,
      createdAt: quote.fechaEmision,
      updatedAt: quote.fechaEmision,
      validUntil: quote.fechaCaducidad,
      status: quote.estado,
      estimatedTotal: quote.total,
      notes: quote.descripcion,
      items: quote.items ?? [],
      referenceImage: quote.archivoReferencia
    };
  }

  private toOrder(order: PortalOrderDto): ClientOrder {
    return {
      id: order.codigo,
      quoteId: order.codigoCotizacion,
      title: order.titulo,
      service: order.servicio,
      status: order.estado,
      progress: order.progreso,
      total: order.total,
      updatedAt: order.actualizadoEn,
      deliveryDate: order.fechaEntregaEstimada,
      events: order.eventos ?? []
    };
  }
}

interface PortalQuoteDto {
  id: number;
  codigo: string;
  titulo: string;
  servicio: string;
  descripcion: string;
  fechaEmision: string;
  fechaCaducidad?: string;
  estado: Quote['status'];
  total?: number;
  items?: Quote['items'];
  archivoReferencia?: string;
}

interface PortalOrderDto {
  id: number;
  codigo: string;
  codigoCotizacion: string;
  titulo: string;
  servicio: string;
  estado: ClientOrder['status'];
  progreso: number;
  total: number;
  actualizadoEn: string;
  fechaEntregaEstimada: string;
  eventos?: ClientOrder['events'];
}
