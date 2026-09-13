package com.example.urban_signs.DTO.Pedidos.detallePedido;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.urban_signs.Utils.Enum.EstadoCotizacion;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CotizacionDTO {
    private Long idCotizacion;
    private String codCotizacion;
    private LocalDate fechaEmision;
    private BigDecimal costoTotal;
    private EstadoCotizacion estado;
    private List<CotizacionTrabajoDTO> trabajos;
}