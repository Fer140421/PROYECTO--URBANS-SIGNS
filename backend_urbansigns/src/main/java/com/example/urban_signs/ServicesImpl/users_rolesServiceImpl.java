package com.example.urban_signs.ServicesImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.urban_signs.DTO.UsuarioRoles.UserRolesUpdateDTO;
import com.example.urban_signs.Model.users_rolesModel;
import com.example.urban_signs.Model.users_rolesPK;
import com.example.urban_signs.Repository.RolesRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Repository.users_rolesRepository;
import com.example.urban_signs.Services.users_rolesService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class users_rolesServiceImpl implements users_rolesService {

    private final users_rolesRepository users_rolesRepository;
    private final RolesRepository rolesRepository;
    private final UsersRepository usersRepository;

    @Override
    public List<users_rolesModel> findAll() {
        return users_rolesRepository.findAll();
    }

    @Override
    @Transactional
    public void updateUserRoles(UserRolesUpdateDTO dto) {
        var user = usersRepository.findById(dto.getIdUser())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Roles actuales
        List<users_rolesModel> currentRoles = users_rolesRepository.findByUsers_IdUser(dto.getIdUser());
        List<Long> currentRoleIds = currentRoles.stream()
                .map(ur -> ur.getRoles().getIdRole())
                .toList();

        // Roles nuevos
        List<Long> newRoles = dto.getRoles();

        // 1️⃣ Eliminar roles que ya no están
        for (Long roleId : currentRoleIds) {
            if (!newRoles.contains(roleId)) {
                users_rolesRepository.deleteUserRole(dto.getIdUser(), roleId);
            }
        }

        // 2️⃣ Agregar nuevos roles
        for (Long roleId : newRoles) {
            if (!currentRoleIds.contains(roleId)) {
                var role = rolesRepository.findById(roleId)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                var relation = new users_rolesModel();
                var pk = new users_rolesPK(dto.getIdUser(), roleId);
                relation.setId_user_rol(pk);
                relation.setUsers(user);
                relation.setRoles(role);
                users_rolesRepository.save(relation);
            }
        }
    }

}
