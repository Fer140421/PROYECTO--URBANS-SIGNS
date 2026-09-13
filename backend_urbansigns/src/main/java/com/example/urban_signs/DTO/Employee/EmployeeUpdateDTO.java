package com.example.urban_signs.DTO.Employee;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@Builder
@Data
public class EmployeeUpdateDTO {
   private String ci;
    private String namePeople;
    private String ap;
    private String am;
    private String phoneNumber;
    private String address;
}