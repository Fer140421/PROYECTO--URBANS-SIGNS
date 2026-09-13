package com.example.urban_signs.Projection.Compra;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface CompraProjection {
    Long getIdCompra();

    Long getIdProveedor();

    String getNombreProveedor();

    LocalDateTime getFecha();

    String getCity();

    String getCiudadProveedor();

    String getEstado();

    BigDecimal getTotal();

    Long getIdDetalle();

    Long getIdMaterial();

    Integer getCantidad();

    BigDecimal getPrecioUnitario();

    BigDecimal getSubtotal();
}