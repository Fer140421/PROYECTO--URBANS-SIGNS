package com.example.urban_signs.Controller;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.urban_signs.DTO.Permisos.RolePermissionsUpdateDTO;
import com.example.urban_signs.Model.PermisoModel;
import com.example.urban_signs.ServicesImpl.RolePermissionServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/roles-permisos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Gerente')")
public class RolePermissionController {

    private final RolePermissionServiceImpl rolePermissionService;

    @GetMapping("/rol/{roleId}")
    public Set<PermisoModel> listarPermisosDeRol(@PathVariable Long roleId) {
        return rolePermissionService.getRolePermissions(roleId);
    }

    @PutMapping("/rol/{roleId}")
    public ResponseEntity<Void> actualizarPermisosDeRol(
            @PathVariable Long roleId,
            @RequestBody RolePermissionsUpdateDTO dto) {
        rolePermissionService.updateRolePermissions(roleId, dto);
        return ResponseEntity.noContent().build();
    }
}
