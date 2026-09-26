import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, map, tap } from 'rxjs';
import { ClientOrder, CreateQuoteTrabajoPayload, PublicService, Quote } from '../../Models/client-portal.model';
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
    payload: {
      title: string;
      service?: string;
      items?: Quote['items'];
      trabajos?: CreateQuoteTrabajoPayload[];
      notes?: string;
    },
    file?: File | null
  ): Observable<void> {
    let trabajos: CreateQuoteTrabajoPayload[] = payload.trabajos ?? [];
    if (trabajos.length === 0 && payload.items && payload.items.length > 0) {
      trabajos = payload.items.map(item => ({
        idTrabajo: item.id,
        servicio: item.service || payload.service || 'Servicio solicitado',
        cantidad: item.quantity || 1,
        base: item.base || 0,
        altura: item.altura || 0,
        descripcion: item.description || ''
      }));
    }

    const formattedObservations = [
      payload.title ? `Proyecto: ${payload.title}` : '',
      payload.service ? `Servicio principal: ${payload.service}.` : '',
      ...trabajos.map(t => {
        const dims = (t.base && t.altura) ? `${t.base}m × ${t.altura}m (${(t.base * t.altura).toFixed(2)} m²)` : '';
        return `${t.cantidad} × ${t.servicio}${dims ? ` [${dims}]` : ''}${t.descripcion ? ` - ${t.descripcion}` : ''}`;
      }),
      payload.notes ? `Observaciones: ${payload.notes}` : ''
    ].filter(Boolean).join('\n');

    const dataObj = {
      titulo: payload.title,
      observaciones: formattedObservations,
      trabajos: trabajos
    };

    if (file) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(dataObj));
      formData.append('observaciones', formattedObservations);
      formData.append('file', file);
      return this.http.post<void>(`${API_URL}/portal/solicitudes`, formData, { withCredentials: true });
    }

    return this.http.post<void>(`${API_URL}/portal/solicitudes`, dataObj, { withCredentials: true });
  }

  private toQuote(quote: PortalQuoteDto): Quote {
    return {
      numericId: quote.id,
      id: quote.codigo,
      title: quote.titulo,
      service: quote.servicio,
      createdAt: quote.fechaEmision,
      updatedAt: quote.fechaEmision,
      validUntil: quote.fechaCaducidad,
      status: quote.estado,
      estimatedTotal: quote.total,
      notes: quote.descripcion,
      items: (quote.items ?? []).map(item => ({
        id: item.id,
        service: item.servicio ?? 'Trabajo solicitado',
        description: item.descripcion || '',
        quantity: item.cantidad ?? 1,
        dimensions: (item.base != null && item.altura != null) ? `${item.base}m × ${item.altura}m` : undefined,
        base: item.base,
        altura: item.altura,
        areaTotal: item.areaTotal,
        unitPrice: item.costoUnitario,
        subtotal: item.subtotal
      })),
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

interface PortalCotizacionItemDto {
  id?: number;
  servicio?: string;
  descripcion?: string;
  cantidad?: number;
  base?: number;
  altura?: number;
  areaTotal?: number;
  costoUnitario?: number;
  subtotal?: number;
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
  items?: PortalCotizacionItemDto[];
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
