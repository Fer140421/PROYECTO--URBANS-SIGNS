package com.example.urban_signs.DTO.MaterialProduccion;


import java.math.BigDecimal;

import com.example.urban_signs.Utils.Enum.TipoControl;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegistroMaterialDTO {
    // Datos básicos
    private Long idCategoria;
    private Long idUnidad;
    private String nombre;
    private String caracteristica;
    private String color;
    
    // Stock inicial
    private BigDecimal cantidadInicial;
    
    // NUEVO: Tipo de control
    private TipoControl tipoControl; // ROLLO, PLANCHA, PESO, LINEAL, UNIDAD
    
    // NUEVO: Para materiales tipo ROLLO
    private BigDecimal anchoRollo;
    private BigDecimal largoRolloNuevo;
    
    // NUEVO: Para materiales tipo PLANCHA
    private BigDecimal anchoPlancha;
    private BigDecimal altoPlancha;
    
    // NUEVO: Configuración de stock
    private BigDecimal stockMinimo;
    private BigDecimal porcentajeDesperdicio;
    
    // NUEVO: Para el lote inicial
    private String ubicacion; // Ej: "Estante 
}
