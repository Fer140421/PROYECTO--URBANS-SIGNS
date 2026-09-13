package com.example.urban_signs.DTO.Cotizaciones.ListDetalle;

import java.math.BigDecimal;
import java.util.List;

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
public class CotizacionTrabajoDTO {
    private Long idCotizacionTrabajo;
    private Long idSolicitudTrabajo;
    private Long idTrabajo;
    private String nombreTrabajo;
    private Integer cantidad;
    private BigDecimal base;
    private BigDecimal altura;
    private BigDecimal area_total;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    private List<DetalleMaterialDTO> materiales;
}