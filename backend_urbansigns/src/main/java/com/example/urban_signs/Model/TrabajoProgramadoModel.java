package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

import com.example.urban_signs.Utils.Enum.EstadoTrabajoProgramado;

import java.time.LocalDateTime;

@Entity
@Table(name = "trabajo_programado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrabajoProgramadoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_trabajo_programado")
    private Long idTrabajoProgramado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_planificacion", nullable = false)
    private PlanificacionSemanalModel planificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    private PedidoModel pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_impresion")
    private OrdenImpresionModel ordenImpresion;

    @Column(name = "cliente")
    private String cliente;

    @Column(name = "descripcion_trabajo", columnDefinition = "TEXT", nullable = false)
    private String descripcionTrabajo;

    @Column(name = "area_trabajo", length = 100)
    private String areaTrabajo;

    @Column(name = "direccion", columnDefinition = "TEXT")
    private String direccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajador_asignado")
    private EmployeeModel trabajadorAsignado;

    @Column(name = "trabajador")
    private String trabajador;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "hora_programada")
    private LocalTime horaProgramada;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoTrabajoProgramado estado = EstadoTrabajoProgramado.PENDIENTE;

    @Column(name = "cumplido")
    private Boolean cumplido;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "ultima_modificacion")
    private LocalDateTime ultimaModificacion = LocalDateTime.now();
}
