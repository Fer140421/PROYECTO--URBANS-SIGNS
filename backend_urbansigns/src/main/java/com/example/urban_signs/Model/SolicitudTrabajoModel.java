package com.example.urban_signs.Model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "solicitud_trabajo")
public class SolicitudTrabajoModel {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_solicitud_trabajo")
  private Long idSolicitudTrabajo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_solicitud", nullable = false)
  @JsonBackReference
  private SolicitudCotizacionModel solicitud;

  @ManyToOne
  @JoinColumn(name = "id_trabajo", nullable = false)
  private TrabajosModel trabajo;

  @Column(name = "cantidad")
  private Integer cantidad;

  @Column(name = "base", precision = 10, scale = 2)
  private BigDecimal base;

  @Column(name = "altura", precision = 10, scale = 2)
  private BigDecimal altura;

  @Column(name = "area_total", precision = 10, scale = 2)
  private BigDecimal areaTotal;

  @Column(name = "descripcion")
  private String descripcion;
}