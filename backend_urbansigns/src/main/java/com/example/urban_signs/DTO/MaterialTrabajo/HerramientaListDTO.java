package com.example.urban_signs.DTO.MaterialTrabajo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HerramientaListDTO  {
   private Long idHerramienta;
    private String codigo;
    private String foto;
    private String nombre;
    private String marca;
    private String modelo;
    private String ubicacion;
    private String estadoActual;
    private String observaciones;
    private Boolean activo;
}