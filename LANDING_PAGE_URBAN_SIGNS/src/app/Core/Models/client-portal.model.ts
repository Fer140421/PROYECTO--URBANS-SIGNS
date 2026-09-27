export type QuoteStatus = 'draft' | 'review' | 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
export type OrderStatus = 'design' | 'approval' | 'production' | 'ready' | 'delivery' | 'completed';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  initials: string;
}

export interface QuoteItem {
  id?: number;
  idTrabajo?: number;
  service: string;
  description: string;
  material?: string;
  quantity: number;
  dimensions?: string;
  base?: number;
  altura?: number;
  areaTotal?: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface CreateQuoteTrabajoPayload {
  idTrabajo?: number;
  servicio: string;
  cantidad: number;
  base: number;
  altura: number;
  descripcion?: string;
  material?: string;
}

export interface Quote {
  numericId: number;
  idSolicitud?: number;
  idCotizacion?: number;
  id: string;
  title: string;
  service: string;
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  status: QuoteStatus;
  estimatedTotal?: number;
  items: QuoteItem[];
  notes: string;
  referenceImage?: string;
  editable?: boolean;
  cancelable?: boolean;
}

export interface OrderEvent {
  label: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ClientOrder {
  id: string;
  quoteId: string;
  title: string;
  service: string;
  status: OrderStatus;
  progress: number;
  total: number;
  updatedAt: string;
  deliveryDate: string;
  events: OrderEvent[];
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'quote' | 'order' | 'system';
  read: boolean;
}

export interface PublicService {
  idTrabajo: number;
  nombre: string;
  descripcion: string;
  foto: string;
}

