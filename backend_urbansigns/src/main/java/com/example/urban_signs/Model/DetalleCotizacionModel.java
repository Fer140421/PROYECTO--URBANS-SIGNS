package com.example.urban_signs.Model;

import lombok.*;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_cotizacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCotizacionModel {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_cotizacion")
    private Long idDetalleCotizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cotizacion_trabajo", nullable = false)
    private CotizacionTrabajoModel cotizacionTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    private MaterialProduccionModel material;

}