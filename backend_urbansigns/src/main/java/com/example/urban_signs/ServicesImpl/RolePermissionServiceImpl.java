package com.example.urban_signs.ServicesImpl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.urban_signs.DTO.Permisos.RolePermissionsUpdateDTO;
import com.example.urban_signs.Model.PermisoModel;
import com.example.urban_signs.Model.RolesModel;
import com.example.urban_signs.Repository.PermisoRepository;
import com.example.urban_signs.Repository.RolesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolePermissionServiceImpl {

    private final RolesRepository rolesRepository;
    private final PermisoRepository permisoRepository;

    public List<PermisoModel> listActivePermissions() {
        return permisoRepository.findByEstadoTrueOrderByModuloAscAccionAsc();
    }

    @Transactional
    public void updateRolePermissions(Long roleId, RolePermissionsUpdateDTO dto) {
        RolesModel role = rolesRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        List<Long> permissionIds = dto.getPermissionIds() == null
                ? List.of()
                : dto.getPermissionIds().stream().distinct().toList();

        List<PermisoModel> permissions = permisoRepository.findAllById(permissionIds);
        if (permissions.size() != permissionIds.size()) {
            throw new RuntimeException("Uno o más permisos no existen");
        }

        role.setPermisos(new HashSet<>(permissions));
        rolesRepository.save(role);
    }

    @Transactional(readOnly = true)
    public Set<PermisoModel> getRolePermissions(Long roleId) {
        RolesModel role = rolesRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        return role.getPermisos();
    }
}
