package com.example.urban_signs.Model;

import java.time.LocalDateTime;

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
@Table(name = "sesion_accion")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionAccionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_accion")
    private Long idAccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sesion", nullable = false)
    private SesionModel sesion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 100)
    private String modulo;

    @Column(name = "fecha_accion", nullable = false)
    private LocalDateTime fechaAccion;
}
