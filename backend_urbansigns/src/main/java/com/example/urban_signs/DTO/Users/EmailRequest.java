package com.example.urban_signs.DTO.Users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {

    private String email;
    private String code;
}
