package com.example.urban_signs.DTO.Portal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicioPublicoDTO {
    private Long idTrabajo;
    private String nombre;
    private String descripcion;
    private String foto;
}
