package com.example.urban_signs.DTO.MaterialTrabajo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialTrabajoRegistrarDTO {
  private String nombre;
  private String marca;
  private String modelo;
  private String foto;
  private String ubicacion;
  private String observaciones;
}