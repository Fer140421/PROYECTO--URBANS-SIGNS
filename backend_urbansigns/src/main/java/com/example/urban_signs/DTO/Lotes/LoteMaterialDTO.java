package com.example.urban_signs.DTO.Lotes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoteMaterialDTO {

    private Long idLote;
    private String codigoLote;
    private LocalDateTime fechaIngreso;
    private BigDecimal cantidadInicial;
    private BigDecimal cantidadActual;
    private String ubicacion;
    private Boolean activo;

}
