package com.example.urban_signs.ServicesImpl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.urban_signs.DTO.Employee.EmployeeRegistrationDTO;
import com.example.urban_signs.DTO.Employee.EmployeeUpdateDTO;
import com.example.urban_signs.Model.EmployeeModel;
import com.example.urban_signs.Model.PeopleModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.EmployeeRepository;
import com.example.urban_signs.Repository.PeopleRepository;
import com.example.urban_signs.Repository.RolesRepository;
import com.example.urban_signs.Repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private PeopleRepository peopleRepository;
    @Mock private UsersRepository usersRepository;
    @Mock private RolesRepository rolesRepository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private UserServicesImpl userServices;
    @Mock private PasswordEncoder passwordEncoder;

    private EmployeeServiceImpl service;
    private EmployeeModel employee;

    @BeforeEach
    void setUp() {
        service = new EmployeeServiceImpl(employeeRepository, peopleRepository, usersRepository, rolesRepository,
                cloudinaryService, userServices, passwordEncoder);

        PeopleModel people = new PeopleModel();
        people.setId_people(10L);
        people.setName_people("Ana");
        people.setAp("Pérez");

        employee = new EmployeeModel();
        employee.setIdEmployee(1L);
        employee.setPeople(people);
        employee.setFoto("https://res.cloudinary.com/demo/old.jpg");
        employee.setStatus(true);

        UsersModel user = new UsersModel();
        user.setIdUser(20L);
        user.setRoles(new HashSet<>());

        lenient().when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        lenient().when(employeeRepository.save(any(EmployeeModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(usersRepository.findByIdPeople(10L)).thenReturn(user);
    }

    @Test
    void updateWithoutFileKeepsPreviousPhoto() {
        service.updateEmployee(1L, updateDto(), null);

        assertEquals("https://res.cloudinary.com/demo/old.jpg", employee.getFoto());
        verify(cloudinaryService, never()).uploadFile(any(), anyString());
    }

    @Test
    void updateWithFileStoresReturnedSecureUrl() {
        MockMultipartFile file = new MockMultipartFile("file", "new.png", "image/png",
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10});
        when(cloudinaryService.uploadFile(any(), anyString()))
                .thenReturn("https://res.cloudinary.com/demo/new.png");

        service.updateEmployee(1L, updateDto(), file);

        assertEquals("https://res.cloudinary.com/demo/new.png", employee.getFoto());
    }

    @Test
    void registerDoesNotPersistWhenImageUploadFails() {
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
                new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10});
        when(cloudinaryService.uploadFile(any(), anyString())).thenThrow(new RuntimeException("Cloudinary unavailable"));

        assertThrows(RuntimeException.class,
                () -> service.registerEmployee(EmployeeRegistrationDTO.builder().build(), file));

        verify(peopleRepository, never()).save(any());
        verify(usersRepository, never()).save(any());
        verify(employeeRepository, never()).save(any());
    }

    private EmployeeUpdateDTO updateDto() {
        return EmployeeUpdateDTO.builder()
                .ci("123")
                .namePeople("Ana")
                .ap("Pérez")
                .am("López")
                .phoneNumber("70000000")
                .address("La Paz")
                .build();
    }
}
