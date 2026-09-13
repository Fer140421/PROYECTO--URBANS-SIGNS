package com.example.urban_signs.DTO.Pedidos.detallePedido;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CotizacionTrabajoDTO {
    private Long idCotizacionTrabajo;
    private BigDecimal subtotal;
    private List<DetalleCotizacionDTO> detalles;
}