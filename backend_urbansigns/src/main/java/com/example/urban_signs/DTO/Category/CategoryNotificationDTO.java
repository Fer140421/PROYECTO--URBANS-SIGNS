package com.example.urban_signs.DTO.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryNotificationDTO {

    private Long idCategoria;
    private String nombre;
    private String descripcion;
    private Boolean estado;
    private String accion;
}
