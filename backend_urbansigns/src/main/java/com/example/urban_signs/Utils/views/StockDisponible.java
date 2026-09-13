package com.example.urban_signs.Utils.views;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vista_stock_disponible")
@Getter
@Setter
public class StockDisponible {
    @Id
    @Column(name = "id_material")
    private Long idMaterial;

    @Column(name = "estado_stock")
    private String estadoStock;

    @Column(name = "nombre_categoria")
    private String nombreCategoria;

    @Column(name = "foto")
    private String foto;

    @Column(name = "nombre_material")
    private String nombreMaterial;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    @Column(name = "stock_total")
    private Integer stockTotal;

    @Column(name = "unidad_abrev")
    private String unidadAbrev;
}