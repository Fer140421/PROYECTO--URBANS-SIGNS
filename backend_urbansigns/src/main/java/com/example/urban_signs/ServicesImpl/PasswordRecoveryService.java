package com.example.urban_signs.ServicesImpl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.urban_signs.Model.PasswordRecoveryModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.PasswordRecoveryRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.UserServices;

@Service
public class PasswordRecoveryService {
    private final UsersRepository users;
    private final PasswordRecoveryRepository recoveries;
    private final UserServices mail;
    private final PasswordEncoder encoder;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    @Autowired
    public PasswordRecoveryService(UsersRepository users, PasswordRecoveryRepository recoveries,
            UserServices mail, PasswordEncoder encoder) {
        this(users, recoveries, mail, encoder, Clock.systemUTC());
    }

    PasswordRecoveryService(UsersRepository users, PasswordRecoveryRepository recoveries,
            UserServices mail, PasswordEncoder encoder, Clock clock) {
        this.users = users; this.recoveries = recoveries; this.mail = mail; this.encoder = encoder; this.clock = clock;
    }

    // All operations lock the user row, including the first request with no recovery row yet.
    @Transactional
    public void send(String email) {
        UsersModel user = activeUser(email);
        Instant now = clock.instant();
        var previous = recoveries.findById(user.getIdUser()).orElse(null);
        if (previous != null && previous.getNextSendAt().isAfter(now))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Espera un minuto antes de solicitar otro código.");
        String code = String.valueOf(random.nextInt(900000) + 100000);
        try { mail.sendRecoveryCode(user.getUserAcces(), code); }
        catch (MailException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No pudimos enviar el código. Inténtalo más tarde.");
        }
        PasswordRecoveryModel recovery = new PasswordRecoveryModel();
        recovery.setUserId(user.getIdUser());
        recovery.setCodeHash(hash(code));
        recovery.setCodeExpiresAt(now.plusSeconds(300));
        recovery.setNextSendAt(now.plusSeconds(60));
        recoveries.save(recovery); // Successful resend also invalidates any previous reset token.
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public String verify(String email, String code) {
        UsersModel user = activeUser(email);
        PasswordRecoveryModel recovery = recoveries.findById(user.getIdUser()).orElseThrow(this::invalidCode);
        if (recovery.getCodeHash() == null || !recovery.getCodeExpiresAt().isAfter(clock.instant()) || recovery.getAttempts() >= 5)
            throw invalidCode();
        recovery.setAttempts(recovery.getAttempts() + 1);
        if (code == null || !code.matches("[0-9]{6}") || !matches(code, recovery.getCodeHash())) {
            recoveries.save(recovery);
            throw invalidCode();
        }
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        recovery.setCodeHash(null);
        recovery.setTokenHash(hash(token));
        recovery.setTokenExpiresAt(clock.instant().plusSeconds(600));
        recoveries.save(recovery);
        return token;
    }

    @Transactional
    public void reset(String email, String token, String password) {
        validatePassword(password);
        UsersModel user = activeUser(email);
        PasswordRecoveryModel recovery = recoveries.findById(user.getIdUser()).orElseThrow(this::invalidToken);
        if (token == null || token.length() != 43 || recovery.getTokenHash() == null
                || !recovery.getTokenExpiresAt().isAfter(clock.instant()) || !matches(token, recovery.getTokenHash()))
            throw invalidToken();
        user.setPasswordAcces(encoder.encode(password));
        users.save(user);
        recovery.setTokenHash(null);
        recovery.setCodeHash(null);
        recoveries.save(recovery); // Consumption and password update commit atomically.
    }

    @Transactional
    @PreAuthorize("hasRole('Gerente')")
    public void adminReset(Long userId, String password) {
        validatePassword(password);
        if (userId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario requerido.");
        UsersModel selected = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
        UsersModel user = activeUser(selected.getUserAcces());
        user.setPasswordAcces(encoder.encode(password));
        users.save(user);
        recoveries.findById(userId).ifPresent(recovery -> {
            recovery.setCodeHash(null); recovery.setTokenHash(null); recoveries.save(recovery);
        });
    }

    private UsersModel activeUser(String email) {
        if (email == null || email.isBlank() || email.length() > 254)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresa un correo válido.");
        return users.findByUserAccesForUpdate(email.trim()).filter(UsersModel::isState_user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede recuperar esta cuenta."));
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes UTF-8.");
    }
    private ResponseStatusException invalidCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código incorrecto, expirado o sin intentos disponibles. Solicita otro código.");
    }
    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "La autorización para restablecer expiró o no es válida. Solicita otro código.");
    }
    private boolean matches(String value, String expected) {
        return MessageDigest.isEqual(hash(value).getBytes(StandardCharsets.US_ASCII), expected.getBytes(StandardCharsets.US_ASCII));
    }
    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
