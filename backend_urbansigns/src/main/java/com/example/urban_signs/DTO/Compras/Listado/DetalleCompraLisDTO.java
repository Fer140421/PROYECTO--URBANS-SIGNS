package com.example.urban_signs.DTO.Compras.Listado;

import java.math.BigDecimal;

public record DetalleCompraLisDTO(
    Long idDetalleCompra,
    Long idMaterial,
    Integer cantidad,
    BigDecimal precioUnitario,
    BigDecimal subtotal,
    BigDecimal precioVenta
) {}