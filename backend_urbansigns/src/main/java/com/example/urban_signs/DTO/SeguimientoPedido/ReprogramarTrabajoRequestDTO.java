package com.example.urban_signs.DTO.SeguimientoPedido;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ReprogramarTrabajoRequestDTO {
    private LocalDate nuevaFecha;
    private String motivo;
}