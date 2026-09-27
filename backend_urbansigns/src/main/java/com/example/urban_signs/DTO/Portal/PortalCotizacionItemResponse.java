package com.example.urban_signs.DTO.Portal;

import java.math.BigDecimal;

public record PortalCotizacionItemResponse(
        Long id,
        Long idTrabajo,
        String servicio,
        String descripcion,
        String material,
        Integer cantidad,
        BigDecimal base,
        BigDecimal altura,
        BigDecimal areaTotal,
        BigDecimal costoUnitario,
        BigDecimal subtotal) {
}
