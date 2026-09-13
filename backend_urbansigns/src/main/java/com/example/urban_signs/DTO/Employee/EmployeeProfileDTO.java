package com.example.urban_signs.DTO.Employee;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileDTO {
 private Long idEmployee;
    private String foto;
    private String ci;
    private String firstName;
    private String paternalLastName;
    private String maternalLastName;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String email;
    private LocalDate hireDate;
    private String role;
    private Boolean status;
}