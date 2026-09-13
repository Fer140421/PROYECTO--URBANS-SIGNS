package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "planificacion_semanal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanificacionSemanalModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_planificacion")
    private Long idPlanificacion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private UsersModel creadoPor;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "planificacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrabajoProgramadoModel> trabajos;
    
}