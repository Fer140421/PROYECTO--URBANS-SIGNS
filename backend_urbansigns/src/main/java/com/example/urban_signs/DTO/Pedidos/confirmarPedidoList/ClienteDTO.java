package com.example.urban_signs.DTO.Pedidos.confirmarPedidoList;

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
public class ClienteDTO {
    private String nombre;
    private String tipoCliente;
    private String tipoClientePersonaEmpresa;
    private String correo;
}
