package com.example.urban_signs.DTO.Dashboard;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MaterialStockBajoDTO {
    private String nombre;
    private String foto;
    private BigDecimal stockActual;
    private BigDecimal stockMinimo;
    private String unidad;
    private String estado; // AGOTADO, BAJO STOCK
}