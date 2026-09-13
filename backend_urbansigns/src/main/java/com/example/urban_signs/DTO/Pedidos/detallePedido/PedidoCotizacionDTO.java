package com.example.urban_signs.DTO.Pedidos.detallePedido;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.urban_signs.Utils.Enum.EstadoPago;
import com.example.urban_signs.Utils.Enum.EstadoPedido;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PedidoCotizacionDTO {
    private Long idPedido;
    private EstadoPedido estadoPedido; // CAMBIADO de String a Enum
    private EstadoPago estadoPago; // NUEVO campo
    private LocalDate fechaPedido;
    private BigDecimal anticipo;
    private BigDecimal saldoPendiente;
    private BigDecimal totalPedido;
    private CotizacionDTO cotizacion;
}