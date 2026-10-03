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

  cancelQuote(id: number): Observable<void> {
    return this.http.put<void>(`${API_URL}/portal/solicitudes/${id}/cancelar`, {}, { withCredentials: true });
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
    const { dataObj, formattedObservations, hasTrabajoFiles, rawTrabajos } = this.buildQuoteRequest(payload);

    if (file || hasTrabajoFiles) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(dataObj));
      formData.append('observaciones', formattedObservations);
      if (file) {
        formData.append('file', file);
      }
      rawTrabajos.forEach((t, i) => {
        if (t.file) {
          formData.append(`trabajo_file_${i}`, t.file);
        }
      });
      return this.http.post<void>(`${API_URL}/portal/solicitudes`, formData, { withCredentials: true });
    }

    return this.http.post<void>(`${API_URL}/portal/solicitudes`, dataObj, { withCredentials: true });
  }

  updateQuote(
    id: number,
    payload: {
      title: string;
      service?: string;
      items?: Quote['items'];
      trabajos?: CreateQuoteTrabajoPayload[];
      notes?: string;
    },
    file?: File | null
  ): Observable<void> {
    const { dataObj, formattedObservations, hasTrabajoFiles, rawTrabajos } = this.buildQuoteRequest(payload);

    if (file || hasTrabajoFiles) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(dataObj));
      formData.append('observaciones', formattedObservations);
      if (file) {
        formData.append('file', file);
      }
      rawTrabajos.forEach((t, i) => {
        if (t.file) {
          formData.append(`trabajo_file_${i}`, t.file);
        }
      });
      return this.http.put<void>(`${API_URL}/portal/solicitudes/${id}`, formData, { withCredentials: true });
    }

    return this.http.put<void>(`${API_URL}/portal/solicitudes/${id}`, dataObj, { withCredentials: true });
  }

  private buildQuoteRequest(payload: {
    title: string;
    service?: string;
    items?: Quote['items'];
    trabajos?: CreateQuoteTrabajoPayload[];
    notes?: string;
  }) {
    let trabajos: CreateQuoteTrabajoPayload[] = payload.trabajos ?? [];
    if (trabajos.length === 0 && payload.items && payload.items.length > 0) {
      trabajos = payload.items.map(item => ({
        idTrabajo: item.idTrabajo || item.id,
        servicio: item.service || payload.service || 'Servicio solicitado',
        cantidad: item.quantity || 1,
        base: item.base || 0,
        altura: item.altura || 0,
        descripcion: item.description || '',
        material: item.material || '',
        archivoReferencia: item.referenceImage
      }));
    }

    const hasTrabajoFiles = trabajos.some(t => !!t.file);
    const cleanTrabajos = trabajos.map(t => ({
      idTrabajo: t.idTrabajo,
      servicio: t.servicio,
      cantidad: t.cantidad,
      base: t.base,
      altura: t.altura,
      descripcion: t.descripcion,
      material: t.material,
      archivoReferencia: t.archivoReferencia
    }));

    const formattedObservations = [
      payload.title ? `Proyecto: ${payload.title}` : '',
      payload.service ? `Servicio principal: ${payload.service}.` : '',
      ...cleanTrabajos.map(t => {
        const dims = (t.base && t.altura) ? `${t.base}m × ${t.altura}m (${(t.base * t.altura).toFixed(2)} m²)` : '';
        const mat = t.material ? ` (Material: ${t.material})` : '';
        return `${t.cantidad} × ${t.servicio}${dims ? ` [${dims}]` : ''}${mat}${t.descripcion ? ` - ${t.descripcion}` : ''}`;
      }),
      payload.notes ? `Observaciones: ${payload.notes}` : ''
    ].filter(Boolean).join('\n');

    const dataObj = {
      titulo: payload.title,
      observaciones: formattedObservations,
      trabajos: cleanTrabajos
    };

    return { dataObj, formattedObservations, hasTrabajoFiles, rawTrabajos: trabajos };
  }

  private toQuote(quote: PortalQuoteDto): Quote {
    const status = quote.estado;
    const isReview = status === 'review' || status === 'draft' || status === 'pending';
    const isQuoted = status === 'quoted';

    return {
      numericId: quote.id,
      idSolicitud: quote.idSolicitud ?? quote.id,
      idCotizacion: quote.idCotizacion,
      id: quote.codigo,
      title: quote.titulo,
      service: quote.servicio,
      createdAt: quote.fechaEmision,
      updatedAt: quote.fechaEmision,
      validUntil: quote.fechaCaducidad,
      status: quote.estado,
      estimatedTotal: quote.total,
      notes: quote.descripcion,
      editable: quote.editable !== undefined ? quote.editable : isReview,
      cancelable: quote.cancelable !== undefined ? quote.cancelable : (isReview || isQuoted),
      items: (quote.items ?? []).map(item => ({
        id: item.id,
        idTrabajo: item.idTrabajo,
        service: item.servicio ?? 'Trabajo solicitado',
        description: item.descripcion || '',
        material: item.material || '',
        quantity: item.cantidad ?? 1,
        dimensions: (item.base != null && item.altura != null) ? `${item.base}m × ${item.altura}m` : undefined,
        base: item.base,
        altura: item.altura,
        areaTotal: item.areaTotal,
        unitPrice: item.costoUnitario,
        subtotal: item.subtotal,
        referenceImage: item.archivoReferencia
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
  idTrabajo?: number;
  servicio?: string;
  descripcion?: string;
  material?: string;
  cantidad?: number;
  base?: number;
  altura?: number;
  areaTotal?: number;
  costoUnitario?: number;
  subtotal?: number;
  archivoReferencia?: string;
}

interface PortalQuoteDto {
  id: number;
  idSolicitud?: number;
  idCotizacion?: number;
  codigo: string;
  titulo: string;
  servicio: string;
  descripcion: string;
  fechaEmision: string;
  fechaCaducidad?: string;
  estado: Quote['status'];
  total?: number;
  editable?: boolean;
  cancelable?: boolean;
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
