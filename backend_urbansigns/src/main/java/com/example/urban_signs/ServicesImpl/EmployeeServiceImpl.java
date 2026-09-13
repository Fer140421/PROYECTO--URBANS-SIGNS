package com.example.urban_signs.ServicesImpl;

import java.security.SecureRandom;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.urban_signs.DTO.Employee.EmployeeProfileDTO;
import com.example.urban_signs.DTO.Employee.EmployeeRegistrationDTO;
import com.example.urban_signs.DTO.Employee.EmployeeResponseDTO;
import com.example.urban_signs.DTO.Employee.EmployeeUpdateDTO;
import com.example.urban_signs.DTO.Employee.EmployyeDetailDTO;
import com.example.urban_signs.DTO.Employee.UsuarioEmpleadoDTO;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Model.RolesModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Projection.Empleados.ListEmpleadosProjection;
import com.example.urban_signs.Repository.EmployeeRepository;
import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Repository.RolesRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.EmployeeService;
import com.example.urban_signs.Utils.Enum.CloudinaryFolder;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PeopleRepository peopleRepository;
    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final CloudinaryService cloudinaryService;
    private final UserServicesImpl userServices;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<EmployeeModel> findAll() {
        return employeeRepository.findAll(Sort.by(
                Sort.Order.asc("people.name_people"),
                Sort.Order.asc("people.ap"),
                Sort.Order.asc("people.am")));
    }

    @Override
    public Page<EmployyeDetailDTO> listEmployees(Boolean status, String searchTerm, Pageable pageable) {
        return employeeRepository.findByFiltersUnified(status, searchTerm, pageable)
                .map(this::convertToDTO);
    }

    private EmployyeDetailDTO convertToDTO(EmployeeModel employee) {
        UsersModel user = usersRepository.findByIdPeople(employee.getPeople().getId_people());

        List<String> roles = user != null
                ? user.getRoles().stream().map(role -> role.getName_role()).collect(Collectors.toList())
                : List.of();

        return EmployyeDetailDTO.builder()
                .idEmployee(employee.getIdEmployee())
                .ci(employee.getPeople().getCi())
                .name(employee.getPeople().getName_people())
                .ap(employee.getPeople().getAp())
                .am(employee.getPeople().getAm())
                .phone(employee.getPeople().getPhone_number())
                .address(employee.getPeople().getAddres())
                .hireDate(employee.getHireDate())
                .idUser(user.getIdUser())
                .status(employee.getStatus())
                .foto(employee.getFoto())
                .roles(roles)
                .build();
    }

    @Override
    public Optional<EmployeeModel> findById(Long id) {
        return employeeRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    @Transactional
    public EmployeeResponseDTO registerEmployee(EmployeeRegistrationDTO dto, MultipartFile file) {
        String imageUrl = uploadEmployeeImageIfPresent(file);

        PeopleModel people = new PeopleModel();
        people.setCi(dto.getCi());
        people.setName_people(dto.getNamePeople());
        people.setAp(dto.getAp());
        people.setAm(dto.getAm());
        people.setPhone_number(dto.getPhoneNumber());
        people.setAddres(dto.getAddress());
        people = peopleRepository.save(people);

        String generatedPassword = generateRandomPassword(8);
        String hashedPassword = passwordEncoder.encode(generatedPassword);

        UsersModel user = new UsersModel();
        user.setIdPeople(people.getId_people());
        user.setUserAcces(dto.getUserAcces());
        user.setPasswordAcces(hashedPassword);
        user.setState_user(true);
        List<RolesModel> roles = rolesRepository.findAllById(dto.getRoleIds());
        user.setRoles(new HashSet<>(roles));
        user = usersRepository.save(user);

        EmployeeModel employee = new EmployeeModel();
        employee.setPeople(people);
        employee.setStatus(true);
        employee.setFoto(imageUrl);
        employee = employeeRepository.save(employee);

        String nombreCompleto = people.getName_people() + " " + people.getAp() + " " + people.getAm();
        List<String> nombresRoles = roles.stream().map(RolesModel::getName_role).toList();
        String userEmail = dto.getUserAcces();
        CompletableFuture.runAsync(() -> {
            try {
                // Enviar correo
                userServices.sendEmployeeCredentials(
                        userEmail,
                        nombreCompleto,
                        userEmail,
                        generatedPassword);
            } catch (Exception e) {
                System.err.println("Error al enviar correo: " + e.getMessage());
            }
        });

        return new EmployeeResponseDTO(
                nombreCompleto,
                people.getCi(),
                people.getPhone_number(),
                people.getAddres(),
                user.getUserAcces(),
                generatedPassword,
                nombresRoles,
                employee.getFoto());
    }

    private String generateRandomPassword(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }

    @Override
    @Transactional
    public EmployyeDetailDTO updateEmployee(Long employeeId, EmployeeUpdateDTO dto, MultipartFile file) {
        EmployeeModel employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        String newImageUrl = uploadEmployeeImageIfPresent(file);
        PeopleModel people = employee.getPeople();
        people.setCi(dto.getCi());
        people.setName_people(dto.getNamePeople());
        people.setAp(dto.getAp());
        people.setAm(dto.getAm());
        people.setPhone_number(dto.getPhoneNumber());
        people.setAddres(dto.getAddress());
        peopleRepository.save(people);
        if (newImageUrl != null) {
            employee.setFoto(newImageUrl);
        }
        employee = employeeRepository.save(employee);
        return convertToDTO(employee);
    }

    private String uploadEmployeeImageIfPresent(MultipartFile file) {
        if (file == null) {
            return null;
        }
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo de imagen está vacío");
        }
        return cloudinaryService.uploadFile(file, CloudinaryFolder.EMPLEADOS.getFolderName());
    }

    @Override
    public void deleteEmployeeLogic(Long idEmployee) {
        EmployeeModel employee = employeeRepository.findByIdEmployee(idEmployee)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        employee.setStatus(false);
        employeeRepository.save(employee);
        UsersModel user = usersRepository.findByIdPeople(employee.getPeople().getId_people());
        if (user != null) {
            user.setState_user(false);
            usersRepository.save(user);
        }
    }

    @Override
    public void activateEmployeeLogic(Long idEmployee) {
        EmployeeModel employee = employeeRepository.findByIdEmployee(idEmployee)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        employee.setStatus(true);
        employeeRepository.save(employee);

        UsersModel user = usersRepository.findByIdPeople(employee.getPeople().getId_people());
        if (user != null) {
            user.setState_user(true);
            usersRepository.save(user);
        }
    }

    public List<ListEmpleadosProjection> obtenerEmpleadosActivos() {
        return employeeRepository.ListEmpleadosProjection();
    }

    @Override
    public Page<UsuarioEmpleadoDTO> getEmployeeList(int page, int size, String searchTerm, Boolean estadoUsuario) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> results = employeeRepository.findEmployeeListWithFilters(searchTerm, estadoUsuario, pageable);
        return results.map(row -> new UsuarioEmpleadoDTO(
                (String) row[0], // nombreCompleto
                (Boolean) row[1], // estadoUsuario
                (String) row[2], // usuario
                (Long) row[3], // idUsuario
                (String) row[4] // foto
        ));
    }

    @Override
    public EmployeeProfileDTO getCurrentEmployeeProfile() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        EmployeeModel employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        UsersModel user = usersRepository.findByUserAcces(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mapToDTO(employee, user);
    }

    private EmployeeProfileDTO mapToDTO(EmployeeModel employee, UsersModel user) {
        PeopleModel people = employee.getPeople();

        String role = user.getRoles().stream()
                .map(RolesModel::getName_role)
                .findFirst()
                .orElse("Sin rol");

        String memberSince = employee.getHireDate() != null
                ? employee.getHireDate().format(DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("es")))
                : "";

        return EmployeeProfileDTO.builder()
                .idEmployee(employee.getIdEmployee())
                .foto(employee.getFoto())
                .ci(people.getCi())
                .firstName(people.getName_people())
                .paternalLastName(people.getAp())
                .maternalLastName(people.getAm())
                .fullName(people.getName_people() + " " + people.getAp() + " " + people.getAm())
                .phoneNumber(people.getPhone_number())
                .address(people.getAddres())
                .email(user.getUserAcces())
                .hireDate(employee.getHireDate())
                .role(role)
                .status(employee.getStatus())
                .build();
    }

}
