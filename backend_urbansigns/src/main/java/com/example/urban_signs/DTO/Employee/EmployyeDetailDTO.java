package com.example.urban_signs.DTO.Employee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@Data
public class EmployyeDetailDTO {
   private Long idEmployee;
    private String ci;
    private String name;
    private String ap;
    private String am;
    private String phone;
    private String address;
    private LocalDate hireDate;
    private Long idUser;
    private Boolean status;
    private String foto;
    private List<String> roles;
}
