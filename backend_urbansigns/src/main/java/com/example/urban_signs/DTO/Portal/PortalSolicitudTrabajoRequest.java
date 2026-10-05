package com.example.urban_signs.DTO.Portal;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PortalSolicitudTrabajoRequest(
        Long idTrabajo,
        String servicio,
        Integer cantidad,
        BigDecimal base,
        BigDecimal altura,
        String descripcion,
        String material,
        String archivoReferencia,
        String unidadMedida) {
    public PortalSolicitudTrabajoRequest(
            Long idTrabajo,
            String servicio,
            Integer cantidad,
            BigDecimal base,
            BigDecimal altura,
            String descripcion,
            String material,
            String archivoReferencia) {
        this(idTrabajo, servicio, cantidad, base, altura, descripcion, material, archivoReferencia, "m");
    }
}
