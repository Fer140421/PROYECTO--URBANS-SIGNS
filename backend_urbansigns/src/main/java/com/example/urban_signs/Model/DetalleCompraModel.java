package com.example.urban_signs.Model;

import java.math.BigDecimal;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "detalle_compras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCompraModel {
   
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_compra")
    private Long idDetalleCompra;

    @ManyToOne
    @JoinColumn(name = "id_compra", nullable = false)
    private CompraModel compra;

    @ManyToOne
    @JoinColumn(name = "id_material", nullable = false)
    private MaterialProduccionModel material;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}