package com.example.urban_signs.DTO.Pedidos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.urban_signs.Utils.Enum.EstadoPago;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

import lombok.Data;

@Data
public class PedidoResumenDTO {
    private Long idPedido;
    private String cliente;
    private LocalDate fechaPedido;
    private BigDecimal total;
    private EstadoPedido estadoPedido;
    private EstadoPago estadoPago;
}