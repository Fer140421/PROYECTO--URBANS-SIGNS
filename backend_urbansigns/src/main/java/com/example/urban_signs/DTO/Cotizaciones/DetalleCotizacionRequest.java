package com.example.urban_signs.DTO.Cotizaciones;

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
public class DetalleCotizacionRequest {
    private Long idMaterial;
    private Integer cantidad;
    private BigDecimal costoMaterial;
    private BigDecimal subtotal;

}