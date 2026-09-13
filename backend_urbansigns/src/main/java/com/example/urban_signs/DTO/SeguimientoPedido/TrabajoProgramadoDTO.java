package com.example.urban_signs.DTO.SeguimientoPedido;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class TrabajoProgramadoDTO {
    private Long idTrabajoProgramado;
    private Long idPlanificacion;
    private Long idPedido;
    private String cliente;
    private String descripcionTrabajo;
    private String areaTrabajo;
    private String direccion;
    private Long idTrabajador;
    private String trabajador;
    private LocalDate fechaProgramada;
    private LocalTime horaProgramada;
    private String estado;
    private Boolean cumplido;
    private String observaciones;
}