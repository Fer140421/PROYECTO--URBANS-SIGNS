package com.example.urban_signs.DTO.SeguimientoPedido;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class PlanificacionSemanalDTO {
    private Long idPlanificacion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String observaciones;
    private List<TrabajoProgramadoDTO> trabajos;
    private EstadisticasDTO estadisticas;
    
    @Data
    public static class EstadisticasDTO {
        private long total;
        private long pendientes;
        private long enProceso;
        private long completados;
        private long reprogramados;
    }
}