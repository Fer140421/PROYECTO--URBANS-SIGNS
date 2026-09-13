package com.example.urban_signs.DTO.Facturacion;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DetalleDTO {
    // Datos Estáticos
    private String actividadEconomica = "477300";
    private String codigoProductoSin = "622539";
    private Integer unidadMedida = 1; // 1 = Unidad (Pieza)
    private String codigoProducto; // ID o Código interno de tu trabajo
    private String descripcion; // Nombre del trabajo
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subTotal;
    private BigDecimal montoDescuento;
    private String numeroImei = null;
    private String numeroSerie = null;
}