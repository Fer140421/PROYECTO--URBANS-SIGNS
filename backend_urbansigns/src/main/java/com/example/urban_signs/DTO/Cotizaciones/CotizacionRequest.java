package com.example.urban_signs.DTO.Cotizaciones;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionRequest {
    private String codCotizacion;
    private Long idSolicitud;
    private LocalDate fechaCaducado;
    private List<CotizacionTrabajoRequest> trabajos;
}