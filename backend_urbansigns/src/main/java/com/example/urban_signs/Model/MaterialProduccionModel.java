package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.urban_signs.Utils.Enum.TipoControl;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "material_produccion")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

public class MaterialProduccionModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_material")
    private Long idMaterial;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false, foreignKey = @ForeignKey(name = "fk_categoria"))
    private CategorysModel categoria;

    @ManyToOne
    @JoinColumn(name = "id_unidad", nullable = false, foreignKey = @ForeignKey(name = "fk_unidad"))
    private UnidadMedidaModel unidad;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "caracteristica", length = 50)
    private String caracteristica;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion = LocalDate.now();

    @Column(name = "foto", length = 255)
    private String foto;

    @Column(name = "estado", nullable = false)
    private Boolean estado = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_control", nullable = false)
    private TipoControl tipoControl;

    @Column(name = "ancho_rollo", precision = 10, scale = 3)
    private BigDecimal anchoRollo;

    @Column(name = "largo_rollo_nuevo", precision = 10, scale = 2)
    private BigDecimal largoRolloNuevo;

    @Column(name = "ancho_plancha", precision = 10, scale = 3)
    private BigDecimal anchoPlancha;

    @Column(name = "alto_plancha", precision = 10, scale = 3)
    private BigDecimal altoPlancha;

    @Column(name = "m2_por_plancha", precision = 10, scale = 4)
    private BigDecimal m2PorPlancha;

    @Column(name = "stock_minimo", nullable = false, precision = 10, scale = 3)
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @Column(name = "porcentaje_desperdicio", precision = 5, scale = 2)
    private BigDecimal porcentajeDesperdicio = new BigDecimal("10.00");
}