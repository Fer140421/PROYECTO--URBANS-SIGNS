package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.urban_signs.Utils.Enum.EstadoCompra;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "compras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompraModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Long idCompra;

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private SupplierModel proveedor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private EstadoCompra estado = EstadoCompra.PENDIENTE;

    @Column(nullable = false)
    private BigDecimal total;

    @OneToMany(mappedBy = "compra", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<DetalleCompraModel> detalles;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

}