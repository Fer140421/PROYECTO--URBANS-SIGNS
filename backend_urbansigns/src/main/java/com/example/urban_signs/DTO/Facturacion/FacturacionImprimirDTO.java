package com.example.urban_signs.DTO.Facturacion;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FacturacionImprimirDTO {

    private boolean tieneFactura;
    private String urlQr;
}