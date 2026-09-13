package com.example.urban_signs.DTO.OrdenImpresion;

import java.util.List;

import lombok.Data;

@Data
public class OrdenImpresionModificarDTO {
    private String observaciones;
    private List<DetalleOrdenDTO> detalles;
}
