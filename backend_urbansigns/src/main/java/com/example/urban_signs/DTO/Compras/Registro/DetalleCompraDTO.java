package com.example.urban_signs.DTO.Compras.Registro;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DetalleCompraDTO {
    private Long idMaterial;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;
    private String ubicacion;
}
