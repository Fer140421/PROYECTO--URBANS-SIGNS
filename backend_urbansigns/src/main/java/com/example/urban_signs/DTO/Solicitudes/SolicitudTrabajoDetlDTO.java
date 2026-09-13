package com.example.urban_signs.DTO.Solicitudes;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudTrabajoDetlDTO {
    private Long idSolicitudTrabajo;
    private Long idTrabajo;
    private String nombreTrabajo;
    private Integer cantidad;
    private BigDecimal base;
    private BigDecimal altura;
    private BigDecimal areaTotal;
    private String descripcion;
}
