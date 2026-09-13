package com.example.urban_signs.DTO.Solicitudes;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudTrabajoDTO {
    private Long idSolicitudTrabajo;
    private String trabajoNombre;
    private Integer cantidad;
    private BigDecimal base;
    private BigDecimal altura;
    private BigDecimal areaTotal;
    private String descripcion;
}