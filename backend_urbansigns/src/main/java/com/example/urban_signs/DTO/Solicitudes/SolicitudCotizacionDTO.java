package com.example.urban_signs.DTO.Solicitudes;

import java.time.LocalDate;
import java.util.List;

import com.example.urban_signs.Utils.Enum.OrigenSolicitud;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;

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
public class SolicitudCotizacionDTO {
  private Long idSolicitud;
  private String codSolicitud;
  private String clienteNombre;
  private String tipoCliente;
  private String tipoPersonaEmpresa;
  private LocalDate fechaSolicitud;
  private SolicitudCotizacion estado;
  private OrigenSolicitud origen;
  private String archivoReferencia;
  private String observaciones;
  private List<SolicitudTrabajoDTO> trabajos;
}