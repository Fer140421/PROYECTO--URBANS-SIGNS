export interface ResiduoMaterial {
  idResiduo?: number;
  idMaterial: number;
  idLoteOrigen?: number;
  cantidad: number;
  unidad: string;
  ubicacion?: string;
  estado: 'DISPONIBLE' | 'USADO' | 'DESCARTADO';
  fechaRegistro?: string;
  observaciones?: string;
}
