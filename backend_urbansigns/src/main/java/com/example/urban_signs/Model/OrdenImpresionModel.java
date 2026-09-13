package com.example.urban_signs.Model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.urban_signs.Utils.Enum.estadoOrdenImpresion;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orden_impresion")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenImpresionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long idOrden;

    @Column(name = "nro_orden", unique = true, nullable = false)
    private String nroOrden;

    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "id_pedido", nullable = false)
    private PedidoModel pedido;

    @Column(name = "fecha_emision", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "responsable", nullable = false)
    private UsersModel usuario;

    private String observaciones;

    @Column(name = "archivo_adjunto")
    private String archivoAdjunto;

    @Enumerated(EnumType.STRING) // ⚠️ CRÍTICO: Mapea como VARCHAR en lugar de SMALLINT
    @Column(nullable = false)
    private estadoOrdenImpresion estado = estadoOrdenImpresion.PENDIENTE; 

}