package com.example.urban_signs.DTO.Compras.Registro;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompraRequestDTO {
    private Long idProveedor;
    private String observaciones;
    private List<DetalleCompraDTO> detalles;
}
