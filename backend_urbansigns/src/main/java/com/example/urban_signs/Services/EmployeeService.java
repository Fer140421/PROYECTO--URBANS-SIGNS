package com.example.urban_signs.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Employee.EmployeeProfileDTO;
import com.example.urban_signs.DTO.Employee.EmployeeRegistrationDTO;
import com.example.urban_signs.DTO.Employee.EmployeeResponseDTO;
import com.example.urban_signs.DTO.Employee.EmployeeUpdateDTO;
import com.example.urban_signs.DTO.Employee.EmployyeDetailDTO;
import com.example.urban_signs.DTO.Employee.UsuarioEmpleadoDTO;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Projection.Empleados.ListEmpleadosProjection;

public interface EmployeeService {

    List<EmployeeModel> findAll();

    Optional<EmployeeModel> findById(Long id);

    EmployyeDetailDTO updateEmployee(Long employeeId, EmployeeUpdateDTO dto, MultipartFile file);

    void delete(Long id);

    EmployeeResponseDTO registerEmployee(EmployeeRegistrationDTO dto, MultipartFile file);

    Page<EmployyeDetailDTO> listEmployees(Boolean status, String searchTerm, Pageable pageable);

    void deleteEmployeeLogic(Long idEmployee);

    void activateEmployeeLogic(Long idEmployee);

    List<ListEmpleadosProjection> obtenerEmpleadosActivos();

    Page<UsuarioEmpleadoDTO> getEmployeeList(int page, int size, String searchTerm, Boolean estadoUsuario);

    EmployeeProfileDTO getCurrentEmployeeProfile();
}
