package com.example.urban_signs.DTO.Permisos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionsUpdateDTO {
    private List<Long> permissionIds;
}
