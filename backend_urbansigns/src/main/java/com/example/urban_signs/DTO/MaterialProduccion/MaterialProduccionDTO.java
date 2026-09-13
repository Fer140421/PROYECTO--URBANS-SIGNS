package com.example.urban_signs.DTO.MaterialProduccion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialProduccionDTO {
    private Long idCategoria;
    private Long idUnidad;
    private String nombre;
    private String caracteristica;
    private String color;
    private String dimensiones;
}