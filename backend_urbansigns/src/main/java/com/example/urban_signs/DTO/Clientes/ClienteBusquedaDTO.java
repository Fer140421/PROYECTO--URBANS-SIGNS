package com.example.urban_signs.DTO.Clientes;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ClienteBusquedaDTO {
    private Long idCliente;
    private String tipo;
    private String displayName;
}