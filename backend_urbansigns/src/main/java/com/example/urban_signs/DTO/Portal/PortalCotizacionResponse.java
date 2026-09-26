package com.example.urban_signs.DTO.Portal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PortalCotizacionResponse(
        Long id,
        String codigo,
        String titulo,
        String servicio,
        String descripcion,
        LocalDate fechaEmision,
        LocalDate fechaCaducidad,
        String estado,
        BigDecimal total,
        String archivoReferencia) {
}
