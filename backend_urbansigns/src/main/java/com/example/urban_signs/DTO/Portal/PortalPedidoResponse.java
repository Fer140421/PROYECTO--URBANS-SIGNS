package com.example.urban_signs.DTO.Portal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PortalPedidoResponse(
        Long id,
        String codigo,
        String codigoCotizacion,
        String titulo,
        String servicio,
        String estado,
        Integer progreso,
        BigDecimal total,
        LocalDate actualizadoEn,
        LocalDate fechaEntregaEstimada) {
}
