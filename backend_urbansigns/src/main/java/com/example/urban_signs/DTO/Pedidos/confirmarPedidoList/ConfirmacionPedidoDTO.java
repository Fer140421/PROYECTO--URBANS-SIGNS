package com.example.urban_signs.DTO.Pedidos.confirmarPedidoList;

import java.util.List;

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
public class ConfirmacionPedidoDTO {
    private ClienteDTO cliente;
    private CotizacionInfoDTO cotizacion;
    private List<TrabajoCotizadoDTO> trabajos;
}
