package com.example.urban_signs.Services;

import java.util.List;

import com.example.urban_signs.DTO.UsuarioRoles.UserRolesUpdateDTO;
import com.example.urban_signs.Model.users_rolesModel;

public interface users_rolesService {

    List<users_rolesModel> findAll();

    void updateUserRoles(UserRolesUpdateDTO dto);
}
