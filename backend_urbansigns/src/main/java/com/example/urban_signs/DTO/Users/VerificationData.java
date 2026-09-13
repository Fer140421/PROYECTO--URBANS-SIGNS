package com.example.urban_signs.DTO.Users;

import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationData {
    private String code;
    private LocalDateTime expiresAt;
}
