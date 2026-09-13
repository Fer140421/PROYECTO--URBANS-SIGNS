package com.example.urban_signs.Model;

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
@Table(name = "detalle_orden_impresion")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleOrdenImpresionModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden_trabajo", nullable = false)
    private Long idOrdenTrabajo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden", nullable = false)
    private OrdenImpresionModel orden;

    @Column(name = "id_cotizacion_trabajo", nullable = false)
    private Long idCotizacionTrabajo;

    private String observaciones;
}