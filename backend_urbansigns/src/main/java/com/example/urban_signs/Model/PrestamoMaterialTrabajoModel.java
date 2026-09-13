package com.example.urban_signs.Model;

import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.TipoPrestamo;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "prestamos_material_trabajo")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PrestamoMaterialTrabajoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prestamo")
    private Long idPrestamo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    private EmployeeModel empleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    private PedidoModel pedido;

    @Column(name = "fecha_prestamo", nullable = false)
    private LocalDateTime fechaPrestamo;

    @Column(name = "fecha_devolucion")
    private LocalDateTime fechaDevolucion;

    @Enumerated(EnumType.STRING)
    private TipoPrestamo tipo_prestamo;

    @Column(name = "observacion")
    private String observacion;

    @Column(name = "estado", nullable = false, length = 10)
    private String estado;

    @PrePersist
    public void prePersist() {
        this.fechaPrestamo = LocalDateTime.now();
    }
}
