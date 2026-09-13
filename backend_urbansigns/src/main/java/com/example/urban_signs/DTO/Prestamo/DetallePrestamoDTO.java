package com.example.urban_signs.DTO.Prestamo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DetallePrestamoDTO {
    private Long idHerramienta;
    private String nombreHerramienta;
    private String fotoHerramienta;
    private String codigoHerramienta;
    private String marcaHerramienta;
    private String modeloHerramienta;
}
