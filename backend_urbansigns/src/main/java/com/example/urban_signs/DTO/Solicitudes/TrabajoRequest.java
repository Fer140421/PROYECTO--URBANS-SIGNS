package com.example.urban_signs.DTO.Solicitudes;

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
public class TrabajoRequest {
    private Long idTrabajo;
    private Integer cantidad;
    private Double base;
    private Double altura;
    private String descripcion;
}