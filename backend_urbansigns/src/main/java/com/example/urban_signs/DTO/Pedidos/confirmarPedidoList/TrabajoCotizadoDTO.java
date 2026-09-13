package com.example.urban_signs.DTO.Pedidos.confirmarPedidoList;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajoCotizadoDTO {
    private String nombre;
    private Integer cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
}
