export interface MaterialStatsDTO {
  totalMateriales: number;
  totalEnStock: number;
  totalBajoStock: number;
  totalAgotados: number;

  porcentajeEnStock: number;
  porcentajeBajoStock: number;
  porcentajeAgotados: number;
}