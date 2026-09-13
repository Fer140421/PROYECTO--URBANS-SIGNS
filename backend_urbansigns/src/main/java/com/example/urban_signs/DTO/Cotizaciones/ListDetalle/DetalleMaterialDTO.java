package com.example.urban_signs.DTO.Cotizaciones.ListDetalle;

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
public class DetalleMaterialDTO {
    private Long idDetalleCotizacion;
    private Long idMaterial;
    private String nombreMaterial;
}