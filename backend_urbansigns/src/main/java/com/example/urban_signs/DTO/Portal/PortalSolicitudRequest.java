package com.example.urban_signs.DTO.Portal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PortalSolicitudRequest(String observaciones) {
}
