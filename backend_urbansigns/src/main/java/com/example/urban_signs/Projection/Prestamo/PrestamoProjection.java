package com.example.urban_signs.Projection.Prestamo;

import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.TipoPrestamo;

public interface PrestamoProjection {
  Long getIdPrestamo();

  Long getIdPedido();

  Long getIdEmpleado();

  String getNombrePersona();

  String getApellidoPaterno();

  String getApellidoMaterno();

  LocalDateTime getFechaPrestamo();

  LocalDateTime getFechaDevolucion();

  TipoPrestamo getTipoPrestamo();

  String getEstado();

  String getObservacion();

  Long getIdHerramienta();

  String getNombreHerramienta();

  String getFotoHerramienta();

  String getCodigoHerramienta();

  String getMarcaHerramienta();

  String getModeloHerramienta();
}
