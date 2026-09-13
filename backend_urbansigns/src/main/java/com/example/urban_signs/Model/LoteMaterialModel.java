package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lotes_material")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LoteMaterialModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Long idLote;

    // Relación con MaterialProduccion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    private MaterialProduccionModel material;

    @Column(name = "codigo_lote", length = 50, unique = true, nullable = false)
    private String codigoLote;

    // Relación opcional con Compra
    @ManyToOne(optional = true)
    @JoinColumn(name = "id_compra", nullable = true)
    private CompraModel compra;

    @Column(name = "fecha_ingreso", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaIngreso = LocalDateTime.now();

    @Column(name = "cantidad_inicial", precision = 10, scale = 3, nullable = false)
    private BigDecimal cantidadInicial;

    @Column(name = "cantidad_actual", precision = 10, scale = 3, nullable = false)
    private BigDecimal cantidadActual;

    @Column(name = "ancho_rollo", precision = 10, scale = 3)
    private BigDecimal anchoRollo;

    @Column(name = "metros_lineales_actuales", precision = 10, scale = 2)
    private BigDecimal metrosLinealesActuales;

    @Column(name = "ubicacion", length = 50)
    private String ubicacion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}