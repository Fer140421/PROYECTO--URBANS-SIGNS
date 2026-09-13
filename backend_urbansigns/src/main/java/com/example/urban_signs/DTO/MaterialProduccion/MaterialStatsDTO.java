package com.example.urban_signs.DTO.MaterialProduccion;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MaterialStatsDTO {
 private long totalMateriales;
    private long totalEnStock;
    private long totalBajoStock;
    private long totalAgotados;

    // Opcional: porcentajes
    private double porcentajeEnStock;
    private double porcentajeBajoStock;
    private double porcentajeAgotados;
}
