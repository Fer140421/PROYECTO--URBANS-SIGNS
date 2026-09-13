package com.example.urban_signs.DTO.Cotizaciones.detalleCotizacion;

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
public class DetalleMaterialCotizacionDTO {
    private String trabajoNombre;
    private List<MaterialDTO> materiales;
}
