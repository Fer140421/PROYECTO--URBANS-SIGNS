package com.example.urban_signs.DTO.Cotizaciones.detalleCotizacion;

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
public class MaterialDTO {
    private String nombreMaterial;
    private String unidadMedida;
    private BigDecimal cantidad;
    private BigDecimal costoUnitario;
}