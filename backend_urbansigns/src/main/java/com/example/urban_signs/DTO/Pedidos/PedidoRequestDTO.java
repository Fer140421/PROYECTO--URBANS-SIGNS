package com.example.urban_signs.DTO.Pedidos;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PedidoRequestDTO {
    private Long idCotizacion;
    private BigDecimal anticipo;
    private String metodoPago;
    private String observacion;
}