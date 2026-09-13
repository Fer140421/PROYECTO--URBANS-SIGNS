package com.example.urban_signs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.urban_signs.DTO.UsuarioRoles.UserRolesUpdateDTO;
import com.example.urban_signs.Model.users_rolesModel;
import com.example.urban_signs.Services.users_rolesService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user_roles")
@PreAuthorize("hasRole('Gerente')")
public class Users_rolesController {

    private final users_rolesService users_rolesService;

    @GetMapping("/user_rol")
    public List<users_rolesModel> listUsersRoles() {
        return users_rolesService.findAll();
    }

    @PutMapping("/add/{idUser}")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long idUser, @RequestBody UserRolesUpdateDTO dto) {
        dto.setIdUser(idUser);
        users_rolesService.updateUserRoles(dto);
        return ResponseEntity.ok().build();
    }

}
