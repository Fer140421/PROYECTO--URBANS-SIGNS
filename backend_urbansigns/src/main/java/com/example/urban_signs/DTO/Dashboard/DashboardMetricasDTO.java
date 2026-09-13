package com.example.urban_signs.DTO.Dashboard;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetricasDTO {
    private Long totalPedidos;
    private BigDecimal ventasTotales;
    private Long clientesActivos;
    private Long stockCritico;
}