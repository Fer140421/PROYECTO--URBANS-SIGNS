package com.example.urban_signs.DTO.Dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstadoPedidosDTO {
    private Long pendientes;
    private Long enProceso;
    private Long finalizados;
    private Long entregados;
}