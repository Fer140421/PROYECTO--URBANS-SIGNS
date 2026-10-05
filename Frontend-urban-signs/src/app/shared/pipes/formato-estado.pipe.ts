import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un estado eliminando guiones bajos y aplicando Title Case
 * Ejemplo: 'EN_PROCESO' -> 'En Proceso', 'PAGADO_COMPLETO' -> 'Pagado Completo'
 */
export function formatearEstado(estado: string | null | undefined): string {
  if (!estado) return '—';

  const mapaEstados: Record<string, string> = {
    // Estados de Pedido
    'PENDIENTE': 'Pendiente',
    'EN_PROCESO': 'En Proceso',
    'EN_TALLER': 'En Taller',
    'FINALIZADO': 'Finalizado',
    'ENTREGADO': 'Entregado',
    'CANCELADO': 'Cancelado',
    'COMPLETADO': 'Completado',

    // Estados de Pago
    'SIN_PAGAR': 'Sin Pagar',
    'NO_PAGADO': 'No Pagado',
    'ANTICIPO_PAGADO': 'Anticipo Pagado',
    'PAGO_PARCIAL': 'Pago Parcial',
    'PAGADO_COMPLETO': 'Pagado Completo',
    'PAGADO': 'Pagado',

    // Estados de Solicitud y Cotización
    'COTIZADA': 'Cotizada',
    'APROBADA': 'Aprobada',
    'APROBADO': 'Aprobado',
    'REVISION': 'En Revisión',
    'CADUCADA': 'Caducada',
    'RECHAZADO': 'Rechazado'
  };

  const normalizado = estado.trim().toUpperCase();
  if (mapaEstados[normalizado]) {
    return mapaEstados[normalizado];
  }

  // Fallback: Reemplazar guiones bajos por espacios y aplicar Capitalize en cada palabra
  return estado
    .toLowerCase()
    .split('_')
    .filter(palabra => palabra.length > 0)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/**
 * Retorna las clases Tailwind CSS para el badge de Estado de Pedido
 */
export function obtenerClaseEstadoPedido(estado: string | null | undefined): string {
  if (!estado) return 'bg-gray-100 text-gray-700 border-gray-200';

  const est = estado.trim().toUpperCase();
  switch (est) {
    case 'PENDIENTE':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'EN_PROCESO':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'EN_TALLER':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'FINALIZADO':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'ENTREGADO':
    case 'COMPLETADO':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'CANCELADO':
    case 'RECHAZADO':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Retorna las clases Tailwind CSS para el badge de Estado de Pago
 */
export function obtenerClaseEstadoPago(estado: string | null | undefined): string {
  if (!estado) return 'bg-gray-100 text-gray-700 border-gray-200';

  const est = estado.trim().toUpperCase();
  switch (est) {
    case 'PAGADO_COMPLETO':
    case 'PAGADO':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'ANTICIPO_PAGADO':
    case 'PAGO_PARCIAL':
    case 'EN_PROCESO':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'SIN_PAGAR':
    case 'NO_PAGADO':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

@Pipe({
  name: 'formatoEstado',
  standalone: true
})
export class FormatoEstadoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatearEstado(value);
  }
}
