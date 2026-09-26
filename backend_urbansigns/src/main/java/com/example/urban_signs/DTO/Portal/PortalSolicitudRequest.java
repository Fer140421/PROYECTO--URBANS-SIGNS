package com.example.urban_signs.DTO.Portal;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PortalSolicitudRequest(
        String titulo,
        String observaciones,
        List<PortalSolicitudTrabajoRequest> trabajos) {
}
