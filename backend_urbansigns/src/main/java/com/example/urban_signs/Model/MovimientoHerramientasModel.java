package com.example.urban_signs.Model;

import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.TipoMovimientoHerramienta;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class MovimientoHerramientasModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_herramienta", nullable = false)
    private HerramientasModel herramienta;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", length = 20, nullable = false)
    private TipoMovimientoHerramienta tipoMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable")
    private UsersModel responsable;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fecha = LocalDateTime.now();
}
