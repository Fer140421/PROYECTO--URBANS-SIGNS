package com.example.urban_signs.DTO.Pedidos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.urban_signs.Utils.Enum.EstadoPago;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PedidoListDTO {
    private Long idPedido;
    private Long idCliente;
    private Long idCotizacion;
    private String codCotizacion;
    private String nombreCliente;
    private LocalDate fechaPedido;
    private EstadoPedido estadoPedido; // CAMBIADO de String a Enum
    private EstadoPago estadoPago; // NUEVO campo
    private BigDecimal anticipo;
    private BigDecimal saldoPendiente;
    private BigDecimal totalPedido;
}