package com.example.urban_signs.DTO.Compras.Registro;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ConfirmarCompraDTO {
 private List<DetalleCompraDTO> detalles;
}
