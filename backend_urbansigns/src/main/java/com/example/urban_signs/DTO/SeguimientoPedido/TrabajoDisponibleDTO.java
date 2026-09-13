package com.example.urban_signs.DTO.SeguimientoPedido;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class TrabajoDisponibleDTO {
    private Long idCotizacionTrabajo;
    private String nombreTrabajo;
    private String descripcionTrabajo;
    private Integer cantidad;
    private BigDecimal areaTotal;
    private BigDecimal subtotal;
    private Boolean yaProgramado;
}