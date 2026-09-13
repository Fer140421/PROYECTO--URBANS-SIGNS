package com.example.urban_signs.DTO.Pedidos.entrega;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoListoEntregaDTO {
    private Long idPedido;
    private Long idCotizacion;
    private String codCotizacion;
    private String nombreCliente;
    private String telefonoCliente;
    private String direccionCliente;
    private LocalDate fechaPedido;
    private String estadoPedido;
    private String estadoPago;
    private BigDecimal total;
    private BigDecimal anticipo;
    private BigDecimal saldoPendiente;
    private List<String> descripcionTrabajos;
}
