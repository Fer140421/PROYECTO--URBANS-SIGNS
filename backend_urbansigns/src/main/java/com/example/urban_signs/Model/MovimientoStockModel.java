package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.TipoMovimiento;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "movimiento_stock")
public class MovimientoStockModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento_stock")
    private Long idMovimientoStock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material", nullable = false)
    private MaterialProduccionModel material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote")
    private LoteMaterialModel lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra")
    private CompraModel compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsersModel usuario;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(name = "id_trabajo")
    private Long idTrabajo;

    @Column(length = 100)
    private String cliente;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

}