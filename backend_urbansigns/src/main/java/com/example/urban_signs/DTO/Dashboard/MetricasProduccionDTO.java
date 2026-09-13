package com.example.urban_signs.DTO.Dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MetricasProduccionDTO {
    private Long ordenesImpresion;
    private Long trabajosProgramados;
    private Long herramientasEnUso;
    private Double tiempoPromedio; // en días
}