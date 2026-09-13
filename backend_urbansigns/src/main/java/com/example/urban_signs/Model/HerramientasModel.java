package com.example.urban_signs.Model;

import java.time.LocalDate;
import java.time.ZoneId;

import com.example.urban_signs.Utils.Enum.EstadoHerramienta;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "herramientas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HerramientasModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_herramienta")
    private Long idHerramienta;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String marca;

    @Column(length = 100)
    private String modelo;

    @Column(length = 255)
    private String foto;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_actual", length = 20)
    private EstadoHerramienta estadoActual = EstadoHerramienta.DISPONIBLE;

    @Column(length = 100)
    private String ubicacion;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    private Boolean activo = true;

    @PrePersist
    protected void onCreate() {
        this.fechaIngreso = LocalDate.now(ZoneId.of("America/La_Paz"));
    }
}