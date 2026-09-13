package com.example.urban_signs.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.urban_signs.Utils.Enum.EstadoPago;
import com.example.urban_signs.Utils.Enum.EstadoPedido;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cotizacion", nullable = false)
    @JsonIgnoreProperties({ "solicitud", "trabajos" })
    private CotizacionModel cotizacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonIgnoreProperties({ "persona", "empresa" })
    private ClienteModel cliente;

    @Column(name = "fecha_pedido", columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate fechaPedido = LocalDate.now();

    // NUEVO: Estado del flujo de producción
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pedido", length = 20, nullable = false)
    private EstadoPedido estadoPedido = EstadoPedido.PENDIENTE;

    // NUEVO: Estado del flujo de pagos
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", length = 20, nullable = false)
    private EstadoPago estadoPago = EstadoPago.SIN_PAGAR;

    @Column(name = "anticipo", precision = 12, scale = 2)
    private BigDecimal anticipo = BigDecimal.ZERO;

    @Column(name = "saldo_pendiente", precision = 12, scale = 2)
    private BigDecimal saldoPendiente = BigDecimal.ZERO;

    @Column(name = "total", precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    private boolean facturado = false;

    @Column(name = "fecha_entrega_real")
    private LocalDateTime fechaEntregaReal;

    @Column(name = "foto_evidencia", length = 500)
    private String fotoEvidencia;

    @Column(name = "observacion_entrega", columnDefinition = "TEXT")
    private String observacionEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entregado_por")
    @JsonIgnoreProperties({ "people" })
    private EmployeeModel entregadoPor;

    @Column(name = "latitud_entrega", precision = 10, scale = 8)
    private BigDecimal latitudEntrega;

    @Column(name = "longitud_entrega", precision = 11, scale = 8)
    private BigDecimal longitudEntrega;
}