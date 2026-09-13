package com.example.urban_signs.DTO.OrdenImpresion;

import java.util.List;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
@Data
public class ordenImpresionRegistrarDTO {
   private Long idPedido;
    private String observaciones;
    private List<DetalleOrdenDTO> detalles;
}
