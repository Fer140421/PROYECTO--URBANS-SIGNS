package com.example.urban_signs.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reprogramacion_trabajo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReprogramacionTrabajoModel {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reprogramacion")
    private Long idReprogramacion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_trabajo_programado", nullable = false)
    private TrabajoProgramadoModel trabajoProgramado;
    
    @Column(name = "fecha_original", nullable = false)
    private LocalDate fechaOriginal;
    
    @Column(name = "fecha_nueva", nullable = false)
    private LocalDate fechaNueva;
    
    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_reprogramo")
    private UsersModel usuarioReprogramo;
    
    @Column(name = "fecha_reprogramacion")
    private LocalDateTime fechaReprogramacion = LocalDateTime.now();
}
