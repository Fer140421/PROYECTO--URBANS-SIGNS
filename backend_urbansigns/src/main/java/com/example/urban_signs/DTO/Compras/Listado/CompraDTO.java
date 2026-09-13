package com.example.urban_signs.DTO.Compras.Listado;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CompraDTO(
        Long idCompra,
        String proveedor,
        Long idSupplier,
        LocalDateTime fecha,
        String city,
        String estado,
        BigDecimal total,
        List<DetalleCompraLisDTO> detalles) {
}