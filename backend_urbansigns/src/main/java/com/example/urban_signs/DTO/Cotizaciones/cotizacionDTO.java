package com.example.urban_signs.DTO.Cotizaciones;

import java.math.BigDecimal;
import java.time.LocalDate;

public record cotizacionDTO(
        Long idCotizacion,
        String codCotizacion,
        Object solicitud,
        LocalDate fechaEmision,
        LocalDate fechaCaducado,
        BigDecimal costoTotal,
        Enum<?> estado
) {}
