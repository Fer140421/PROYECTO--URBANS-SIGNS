package com.example.urban_signs.DTO.Employee;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioEmpleadoDTO {
    private String nombreCompleto;
    private Boolean estadoUsuario;
    private String usuario;
    private Long idUsuario;
    private String foto;
}
