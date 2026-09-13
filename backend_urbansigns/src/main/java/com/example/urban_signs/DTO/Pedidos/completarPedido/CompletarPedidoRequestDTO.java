package com.example.urban_signs.DTO.Pedidos.completarPedido;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompletarPedidoRequestDTO {
    private PagoFinalDTO pagoFinal;
    private Long idEmpleado;
    private String observacionEntrega;
    private String fotoEvidencia;
    private BigDecimal latitud;
    private BigDecimal longitud;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagoFinalDTO {
        private BigDecimal monto;
        private String metodoPago;
        private String observacion;
    }
}