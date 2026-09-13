package com.example.urban_signs.DTO.Employee;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;

@Getter
@Setter
@Builder
@Data
public class EmployeeRegistrationDTO {

    private String ci;
    private String namePeople;
    private String ap;
    private String am;
    private String phoneNumber;
    private String address;
    private String userAcces;
    private List<Long> roleIds;
}
