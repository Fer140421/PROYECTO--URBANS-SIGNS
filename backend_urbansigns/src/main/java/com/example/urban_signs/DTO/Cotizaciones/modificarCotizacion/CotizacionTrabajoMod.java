package com.example.urban_signs.DTO.Cotizaciones.modificarCotizacion;

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
public class CotizacionTrabajoMod {
    private Long idCotizacionTrabajo;
    private Integer cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    private List<DetalleCotizacionMod> materiales;
}