package com.example.urban_signs.DTO.Pedidos.confirmarPedidoList;

import java.math.BigDecimal;
import java.time.LocalDate;

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
public class CotizacionInfoDTO {
    private Long idCotizacion;
    private String codigo;
    private LocalDate fechaEmision;
    private LocalDate fechaCaducidad;
    private BigDecimal costoTotal;
}
