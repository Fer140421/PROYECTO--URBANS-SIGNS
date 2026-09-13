package com.example.urban_signs.DTO.Employee;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponseDTO {
    private String nombreCompleto;
    private String ci;
    private String telefono;
    private String direccion;
    private String correo;
    private String passwordGenerada; // esta será en texto plano solo para mostrarla una vez
    private List<String> roles;
    private String foto;
}
