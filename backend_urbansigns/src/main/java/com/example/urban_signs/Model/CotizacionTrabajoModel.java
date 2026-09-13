package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cotizacion_trabajo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionTrabajoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cotizacion_trabajo")
    private Long idCotizacionTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cotizacion", nullable = false)
    private CotizacionModel cotizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud_trabajo", nullable = false)
    private SolicitudTrabajoModel solicitudTrabajo;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "costo_unitario", precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "base", precision = 10, scale = 2)
    private BigDecimal base;

    @Column(name = "altura", precision = 10, scale = 2)
    private BigDecimal altura;

    @Column(name = "area_total", precision = 10, scale = 2)
    private BigDecimal areaTotal;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @OneToMany(mappedBy = "cotizacionTrabajo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCotizacionModel> detalles = new ArrayList<>();
}