package com.example.urban_signs.DTO.Pedidos.detallePedido;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DetalleCotizacionDTO {
    private Long idDetalleCotizacion;
    private Long idMaterial;
    private String nombreMaterial;
}