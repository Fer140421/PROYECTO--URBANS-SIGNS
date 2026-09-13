package com.example.urban_signs.Model;

import java.time.Instant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "password_recovery")
@Getter
@Setter
public class PasswordRecoveryModel {
    @Id private Long userId;
    @Column(length = 64) private String codeHash;
    private Instant codeExpiresAt;
    @Column(length = 64) private String tokenHash;
    private Instant tokenExpiresAt;
    private Instant nextSendAt;
    private int attempts;
}
