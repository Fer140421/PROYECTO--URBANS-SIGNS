package com.example.urban_signs.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.example.urban_signs.Model.PermisoModel;
import com.example.urban_signs.ServicesImpl.RolePermissionServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/permisos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Gerente')")
public class PermisoController {

    private final RolePermissionServiceImpl rolePermissionService;

    @GetMapping
    public List<PermisoModel> listarPermisos() {
        return rolePermissionService.listActivePermissions();
    }
}
