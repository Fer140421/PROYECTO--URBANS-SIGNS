package com.example.urban_signs.DTO.Facturacion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacturaResponseDto {
    private Long id; // ID interno del facturador
    private Long numeroFactura;
    private String cuf;
    private Long nit; // NIT del emisor
    private String url; // URL del QR o PDF
}