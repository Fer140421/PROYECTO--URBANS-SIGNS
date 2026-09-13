package com.example.urban_signs.DTO.Residuos;

import java.math.BigDecimal;

import com.example.urban_signs.Utils.Enum.EstadoResiduo;

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
public class ResiduoMaterialDTO {
    private Long idResiduo;
    private Long idMaterial; 
    private Long idLoteOrigen;  
    private BigDecimal cantidad;
    private String unidad;
    private String ubicacion;
    private EstadoResiduo estado;
    private String observaciones;
}