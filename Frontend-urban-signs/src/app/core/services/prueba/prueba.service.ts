import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';


export interface Cotizacion {
  id: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  diasRestantes: number | null;
}

export interface Resumen {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  montoTotal: number;
  tendencia: number;
}

export interface Alerta {
  id: number;
  tipo: 'urgente' | 'advertencia' | 'info';
  mensaje: string;
}
@Injectable({
  providedIn: 'root'
})
export class PruebaService {
  private cotizaciones: Cotizacion[] = [
    { id: 'COT-001', cliente: 'Empresa ABC S.A.', fecha: '2025-11-25', monto: 15420.50, estado: 'pendiente', diasRestantes: 2 },
    { id: 'COT-002', cliente: 'Constructora XYZ', fecha: '2025-11-24', monto: 28750.00, estado: 'aprobada', diasRestantes: null },
    { id: 'COT-003', cliente: 'Comercial López', fecha: '2025-11-23', monto: 9320.75, estado: 'rechazada', diasRestantes: null },
    { id: 'COT-004', cliente: 'Industrias del Sur', fecha: '2025-11-22', monto: 45600.00, estado: 'pendiente', diasRestantes: 1 },
    { id: 'COT-005', cliente: 'Tech Solutions', fecha: '2025-11-21', monto: 12890.30, estado: 'aprobada', diasRestantes: null },
    { id: 'COT-006', cliente: 'Global Trading', fecha: '2025-11-20', monto: 33250.00, estado: 'pendiente', diasRestantes: 3 },
    { id: 'COT-007', cliente: 'Servicios Integrales', fecha: '2025-11-19', monto: 7850.00, estado: 'aprobada', diasRestantes: null },
    { id: 'COT-008', cliente: 'Distribuidora Central', fecha: '2025-11-18', monto: 19420.50, estado: 'rechazada', diasRestantes: null }
  ];

  getCotizaciones(): Observable<Cotizacion[]> {
    return of(this.cotizaciones);
  }

  getResumen(): Observable<Resumen> {
    const resumen: Resumen = {
      total: 42,
      pendientes: 12,
      aprobadas: 23,
      rechazadas: 7,
      montoTotal: 172501.05,
      tendencia: 8.5
    };
    return of(resumen);
  }

  getEstadisticasEstados() {
    return {
      labels: ['Pendientes', 'Aprobadas', 'Rechazadas'],
      data: [12, 23, 7],
      colors: ['#F59E0B', '#10B981', '#EF4444']
    };
  }

  getEstadisticasMontos() {
    return {
      labels: ['Empresa ABC', 'Constructora XYZ', 'Industrias del Sur', 'Global Trading', 'Tech Solutions', 'Otros'],
      data: [15420.50, 28750.00, 45600.00, 33250.00, 12890.30, 36590.25]
    };
  }

  getAlertas(): Observable<Alerta[]> {
    const alertas: Alerta[] = [
      { id: 1, tipo: 'urgente', mensaje: 'Cotización COT-004 vence en 1 día' },
      { id: 2, tipo: 'advertencia', mensaje: 'Cotización COT-001 vence en 2 días' },
      { id: 3, tipo: 'info', mensaje: '3 cotizaciones pendientes de seguimiento' }
    ];
    return of(alertas);
  }
}
