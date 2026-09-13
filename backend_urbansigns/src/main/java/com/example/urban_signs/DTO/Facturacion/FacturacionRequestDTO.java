package com.example.urban_signs.DTO.Facturacion;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FacturacionRequestDTO {
	private Long idPedido;
	private int tipoDocumento = 1;
}