package com.example.urban_signs.DTO.Facturacion;

import java.sql.Timestamp;

import com.example.urban_signs.Model.FacturacionModel;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacturacionDTO {

	private Long id;
	private Long idPedido;
	private String cuf;
	private Long numeroFacturaSiat;
	private Timestamp fechaEmisionSiat;
	private String leyenda;
	private String urlQr;
	private String estado;
	private String jsonEnviado;
	private String jsonRecibido;
	private String mensajesError;
	private Timestamp createdAt;

	public static FacturacionDTO fromEntity(FacturacionModel entity, FacturaResponseDto respDto) {
		FacturacionDTO dto = new FacturacionDTO();
		dto.setId(entity.getId());

		if (entity.getPedido() != null) {
			dto.setIdPedido(entity.getPedido().getIdPedido());
		}

		dto.setCuf(respDto != null ? respDto.getCuf() : entity.getCuf());
		dto.setNumeroFacturaSiat(respDto != null ? respDto.getNumeroFactura() : entity.getNumeroFacturaSiat());


		dto.setUrlQr(respDto != null ? respDto.getUrl() : entity.getUrlQr());
		dto.setEstado(entity.getEstado());
		dto.setJsonEnviado(entity.getJsonEnviado());
		dto.setJsonRecibido(entity.getJsonRecibido());
		dto.setMensajesError(entity.getMensajesError());
		dto.setCreatedAt(entity.getCreatedAt());
		dto.setLeyenda(entity.getLeyenda());

		return dto;
	}

}