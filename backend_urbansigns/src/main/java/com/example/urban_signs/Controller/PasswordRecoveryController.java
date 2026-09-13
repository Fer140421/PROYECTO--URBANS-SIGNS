package com.example.urban_signs.Controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.example.urban_signs.DTO.Users.EmailRequest;
import com.example.urban_signs.DTO.Users.PasswordResetRequest;
import com.example.urban_signs.ServicesImpl.PasswordRecoveryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class PasswordRecoveryController {
    private final PasswordRecoveryService recovery;

    @PostMapping("/enviar-codigo-recuperacion")
    public Map<String, String> send(@RequestBody EmailRequest request) {
        recovery.send(request.getEmail());
        return Map.of("message", "Código enviado. Es válido durante 5 minutos.");
    }
    @PostMapping("/verify-recovery-code")
    public Map<String, String> verify(@RequestBody EmailRequest request) {
        String token = recovery.verify(request.getEmail(), request.getCode());
        return Map.of("message", "Código verificado.", "resetToken", token);
    }
    @PostMapping("/reset-password")
    public Map<String, String> reset(@RequestBody PasswordResetRequest request) {
        recovery.reset(request.getEmail(), request.getResetToken(), request.getNewPassword());
        return Map.of("message", "Contraseña actualizada correctamente.");
    }
    public record AdminResetRequest(Long userId, String newPassword) {}

    @PatchMapping("/admin/reset-password")
    @PreAuthorize("hasRole('Gerente')")
    public Map<String, String> adminReset(@RequestBody AdminResetRequest request) {
        recovery.adminReset(request.userId(), request.newPassword());
        return Map.of("message", "Contraseña actualizada correctamente.");
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> error(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("message", error.getReason()));
    }
}
