package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.EstadoResiduo;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "residuos_material")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResiduoMaterialModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_residuo")
    private Long idResiduo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    @JsonBackReference
    private MaterialProduccionModel material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote_origen")
    @JsonBackReference
    private LoteMaterialModel loteOrigen;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;

    @Column(nullable = false, length = 20)
    private String unidad;

    @Column(length = 100)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    private EstadoResiduo estado = EstadoResiduo.DISPONIBLE;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

}