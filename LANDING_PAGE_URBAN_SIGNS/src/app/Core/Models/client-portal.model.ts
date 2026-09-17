export type QuoteStatus = 'draft' | 'review' | 'quoted' | 'accepted' | 'rejected';
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
  service: string;
  description: string;
  quantity: number;
  dimensions: string;
}

export interface Quote {
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
