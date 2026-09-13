package com.example.urban_signs.DTO.Users;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PasswordResetRequest {
    private String email;
    private String newPassword;
    private String resetToken;
}
