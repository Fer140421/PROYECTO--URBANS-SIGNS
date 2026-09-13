package com.example.urban_signs.Model;

import java.time.LocalDate;
import com.example.urban_signs.Utils.Enum.SolicitudCotizacion;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "solicitud_cotizacion")
public class SolicitudCotizacionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @Column(name = "cod_solicitud", nullable = false, unique = true, length = 50)
    private String codSolicitud;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private ClienteModel cliente;

    @Column(name = "fecha_solicitud")
    private LocalDate fechaSolicitud;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private SolicitudCotizacion estado = SolicitudCotizacion.PENDIENTE;

    @Column(name = "observaciones")
    private String observaciones;

}