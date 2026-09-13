package com.example.urban_signs.DTO.Dashboard;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopClienteDTO {
    private String nombre;
    private String tipo; // Persona o Empresa
    private BigDecimal totalCompras;
    private Long totalPedidos;
}