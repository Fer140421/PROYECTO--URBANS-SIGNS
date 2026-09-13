package com.example.urban_signs.DTO.Cotizaciones.ListDetalle;

import java.math.BigDecimal;
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
public class CotizacionDetalleDTO {
    private Long idCotizacion;
    private String codCotizacion;
    private LocalDate fechaEmision;
    private LocalDate fechaCaducado;
    private BigDecimal costoTotal;
    private String estado;
    private String codSolicitud;
    private String clienteNombre;
    private List<CotizacionTrabajoDTO> trabajos;
}