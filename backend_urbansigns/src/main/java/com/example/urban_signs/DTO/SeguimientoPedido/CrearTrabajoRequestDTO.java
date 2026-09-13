package com.example.urban_signs.DTO.SeguimientoPedido;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class CrearTrabajoRequestDTO {
    private Long idPlanificacion;
    private Long idPedido;
    private LocalDate fechaProgramada;
    private LocalTime horaProgramada;
    private String areaTrabajo;
    private Long idTrabajador;
    private String trabajador;
    private String observaciones;
}