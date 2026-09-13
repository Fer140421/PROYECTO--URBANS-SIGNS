package com.example.urban_signs.DTO.UsuarioRoles;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRolesUpdateDTO {
    private Long idUser;
    private List<Long> roles;
}
