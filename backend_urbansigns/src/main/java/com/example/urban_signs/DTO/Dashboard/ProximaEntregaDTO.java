package com.example.urban_signs.DTO.Dashboard;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProximaEntregaDTO {
    private String cliente;
    private LocalDate fechaEntrega;
    private String prioridad; // ALTA, MEDIA, BAJA
}