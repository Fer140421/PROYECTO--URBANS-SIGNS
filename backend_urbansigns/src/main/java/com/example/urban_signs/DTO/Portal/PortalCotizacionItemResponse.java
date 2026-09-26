package com.example.urban_signs.DTO.Portal;

import java.math.BigDecimal;

public record PortalCotizacionItemResponse(
        Long id,
        String servicio,
        String descripcion,
        Integer cantidad,
        BigDecimal base,
        BigDecimal altura,
        BigDecimal areaTotal,
        BigDecimal costoUnitario,
        BigDecimal subtotal) {
}
