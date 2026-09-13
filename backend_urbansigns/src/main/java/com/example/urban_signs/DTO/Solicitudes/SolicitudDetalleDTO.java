package com.example.urban_signs.DTO.Solicitudes;

import java.time.LocalDate;
import java.util.List;

import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudDetalleDTO {
    private Long idSolicitud;
    private String codSolicitud;
    private ClienteModel cliente;
    private LocalDate fechaSolicitud;
    private SolicitudCotizacion estado;
    private String observaciones;
    private List<SolicitudTrabajoDetlDTO> trabajos;
}
