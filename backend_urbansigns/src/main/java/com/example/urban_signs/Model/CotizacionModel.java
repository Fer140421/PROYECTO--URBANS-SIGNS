package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.example.urban_signs.Utils.Enum.EstadoCotizacion;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cotizaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionModel {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_cotizacion")
  private Long idCotizacion;

  @Column(name = "cod_cotizacion", nullable = false, unique = true, length = 20)
  private String codCotizacion;

  @ManyToOne
  @JoinColumn(name = "id_solicitud", nullable = false)
  @JsonBackReference
  private SolicitudCotizacionModel solicitud;

  @Column(name = "fecha_emision", nullable = false)
  private LocalDate fechaEmision;

  @Column(name = "fecha_caducado", nullable = false)
  private LocalDate fechaCaducado;

  @Column(name = "costo_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal costoTotal = BigDecimal.ZERO;

  @Enumerated(EnumType.STRING)
  @Column(name = "estado", nullable = false, length = 20)
  private EstadoCotizacion estado = EstadoCotizacion.PENDIENTE;

  @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @JsonManagedReference
  private List<CotizacionTrabajoModel> trabajos = new ArrayList<>();
}