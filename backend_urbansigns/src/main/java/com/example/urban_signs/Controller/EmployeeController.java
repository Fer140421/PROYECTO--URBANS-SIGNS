package com.example.urban_signs.Controller;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Employee.EmployeeProfileDTO;
import com.example.urban_signs.DTO.Employee.EmployeeRegistrationDTO;
import com.example.urban_signs.DTO.Employee.EmployeeResponseDTO;
import com.example.urban_signs.DTO.Employee.EmployeeUpdateDTO;
import com.example.urban_signs.DTO.Employee.EmployyeDetailDTO;
import com.example.urban_signs.DTO.Employee.UsuarioEmpleadoDTO;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Projection.Empleados.ListEmpleadosProjection;
import com.example.urban_signs.Services.EmployeeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/listEmployee")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_VER')")
    public Page<EmployyeDetailDTO> getEmployees(
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return employeeService.listEmployees(status, search, pageable);
    }

    @GetMapping("/employee/select/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_VER')")
    public ResponseEntity<EmployeeModel> getById(@PathVariable Long id) {
        return employeeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_CREAR')")
    public ResponseEntity<EmployeeResponseDTO> register(
            @RequestPart("employee") EmployeeRegistrationDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(employeeService.registerEmployee(dto, file));
    }

    @PutMapping(value = "/mod/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_EDITAR')")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestPart("employee") EmployeeUpdateDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto, file));
    }

    @DeleteMapping("/del/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_ELIMINAR')")
    public ResponseEntity<?> deleteLogic(@PathVariable Long id) {
        employeeService.deleteEmployeeLogic(id);
        return ResponseEntity.ok().body(Map.of("message", "Empleado eliminado correctamente"));
    }

    @PutMapping("/activate/{id}")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_EDITAR')")
    public ResponseEntity<?> activateEmployee(@PathVariable Long id) {
        employeeService.activateEmployeeLogic(id);
        return ResponseEntity.ok().body(Map.of("message", "Empleado activado correctamente"));
    }

    @GetMapping("/activos")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_VER')")
    public List<ListEmpleadosProjection> getEmpleadosActivos() {
        return employeeService.obtenerEmpleadosActivos();
    }

    @GetMapping("/listUserEmployee")
    @PreAuthorize("hasRole('Gerente') or hasAuthority('EMPLEADO_VER')")
    public ResponseEntity<Page<UsuarioEmpleadoDTO>> getEmployeeList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchTerm, 
            @RequestParam(required = false) Boolean estadoUsuario) {

        Page<UsuarioEmpleadoDTO> employees = employeeService.getEmployeeList(page, size, searchTerm, estadoUsuario);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeProfileDTO> getCurrentProfile() {
        try {
            EmployeeProfileDTO profile = employeeService.getCurrentEmployeeProfile();
            if (profile == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(profile);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace(); // log para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
