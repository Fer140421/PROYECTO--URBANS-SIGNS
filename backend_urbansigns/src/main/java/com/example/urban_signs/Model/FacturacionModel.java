package com.example.urban_signs.Model;

import java.sql.Timestamp;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "facturacion")
public class FacturacionModel {

	@Id
	@GeneratedValue
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JsonIgnore
	@JoinColumn(name = "id_pedido", referencedColumnName = "id_pedido", nullable = false)
	private PedidoModel pedido;

	// CUF generado por SIAT
	@Column(name = "cuf")
	private String cuf;

	@Column(name = "numero_factura_siat")
	private Long numeroFacturaSiat;

	@Column(name = "fecha_emision_siat")
	private Timestamp fechaEmisionSiat;

	@Column(name = "leyenda")
	private String leyenda;

	@Column(name = "url_qr")
	private String urlQr;

	@Column(name = "estado", nullable = false)
	private String estado;

	@Column(name = "json_enviado", columnDefinition = "TEXT")
	private String jsonEnviado;

	@Column(name = "json_recibido", columnDefinition = "TEXT")
	private String jsonRecibido;

	@Column(name = "mensajes_error", columnDefinition = "TEXT")
	private String mensajesError;

	@Column(name = "created_at")
	private Timestamp createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = new Timestamp(System.currentTimeMillis());
	}

}