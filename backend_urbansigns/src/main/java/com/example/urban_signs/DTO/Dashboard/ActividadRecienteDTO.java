package com.example.urban_signs.DTO.Dashboard;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActividadRecienteDTO {
    private String tipo; // PEDIDO, COTIZACION, PAGO
    private String descripcion;
    private LocalDate fecha;
    private String estado; // COMPLETADO, PENDIENTE, EN_PROCESO
}