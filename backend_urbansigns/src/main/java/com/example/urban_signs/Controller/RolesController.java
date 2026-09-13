package com.example.urban_signs.Controller;
import java.util.List;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.urban_signs.Model.RolesModel;
import com.example.urban_signs.Services.RolesServices;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente')")
@RequestMapping("/role")
@RequiredArgsConstructor
public class RolesController {

    private final RolesServices rolesServices;

    @GetMapping("/listRole")
    public List<RolesModel> listRoles() {
        return rolesServices.findAll();
    }
    
}
