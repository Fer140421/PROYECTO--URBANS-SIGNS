package com.example.urban_signs.DTO.Facturacion;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacturaRequestDTO {
    private CabeceraDTO cabecera;
    private List<DetalleDTO> detalle;
}