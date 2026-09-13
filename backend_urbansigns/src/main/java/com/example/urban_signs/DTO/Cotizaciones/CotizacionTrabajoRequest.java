package com.example.urban_signs.DTO.Cotizaciones;

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
public class CotizacionTrabajoRequest {
    private Long idSolicitudTrabajo;
    private Integer Cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    private List<DetalleCotizacionRequest> materiales;
}
