package com.example.urban_signs.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.DTO.Users.EmailRequest;
import com.example.urban_signs.DTO.Users.VerificationData;
import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.UserServices;
import com.example.urban_signs.Services.RefreshTokenService;
import com.example.urban_signs.Utils.Enum.EstadoSession;
import com.example.urban_signs.config.jwt.JwtUtils;
import com.example.urban_signs.config.VerificationStorage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserServices userServices;
    private final Map<String, VerificationData> verificationCodes = new HashMap<>();
    private final SessionRepository sessionRepository;
    private final UsersRepository usersRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final com.example.urban_signs.config.JwtCookieService jwtCookieService;

    @GetMapping("/listUsers")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente')")
    public List<UsersModel> listUsers() {
        return userServices.findAll();
    }

    @GetMapping("/verificar-email-recuperacion/{userAcces}")
    public ResponseEntity<Map<String, Object>> verificarEmailRecuperacion(@PathVariable String userAcces) {
        try {
            Map<String, Object> response = userServices.verificarEmailParaRecuperacion(userAcces);
            if (!(boolean) response.get("valido")) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("existe", false);
            errorResponse.put("activo", false);
            errorResponse.put("valido", false);
            errorResponse.put("mensaje", "Error al verificar el correo electrónico");
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody EmailRequest request) {
        String email = request.getEmail();
        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        try {
            userServices.sendVerificationCode(email, code);
        } catch (MailAuthenticationException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "code", "MAIL_AUTH_FAILED",
                    "message", "El servicio de correo no está disponible. Contacta con Urban Signs para completar tu registro."));
        } catch (MailException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "code", "MAIL_DELIVERY_FAILED",
                    "message", "No pudimos enviar el código en este momento. Inténtalo más tarde."));
        }
        verificationCodes.put(email, new VerificationData(code, expiresAt));
        VerificationStorage.saveCode(email, code);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Código enviado");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, String>> verifyCode(@RequestBody EmailRequest request) {
        String email = request.getEmail();
        String code = request.getCode();

        VerificationData data = verificationCodes.get(email);
        Map<String, String> response = new HashMap<>();

        if (data != null) {
            if (LocalDateTime.now().isAfter(data.getExpiresAt())) {
                verificationCodes.remove(email);
                response.put("error", "El código ha expirado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (data.getCode().equals(code)) {
                verificationCodes.remove(email);
                VerificationStorage.saveCode(email, code);
                VerificationStorage.isCodeValid(email, code);
                VerificationStorage.markVerified(email);
                response.put("message", "Correo verificado");
                return ResponseEntity.ok(response);
            }
        }

        response.put("error", "Código incorrecto");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @GetMapping("/exists/{userAcces}")
    public ResponseEntity<Map<String, Object>> userExists(@PathVariable String userAcces) {
        boolean exists = userServices.existsUser(userAcces);
        String message = exists ? "El usuario ya existe" : "Usuario disponible";

        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = obtenerCookie(request, com.example.urban_signs.config.JwtCookieService.REFRESH_TOKEN_COOKIE);

        if (refreshToken != null) {
            refreshTokenService.revocarToken(refreshToken).ifPresent(sesion -> {
                sesion.setLoginFin(LocalDateTime.now());
                sesion.setEstado(EstadoSession.CERRADO);
                sessionRepository.save(sesion);
            });
        }
        jwtCookieService.limpiarTokens(response);

        SecurityContextHolder.clearContext();

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Sesión cerrada correctamente");

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = obtenerCookie(request, com.example.urban_signs.config.JwtCookieService.REFRESH_TOKEN_COOKIE);
        if (refreshToken == null) {
            jwtCookieService.limpiarTokens(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sesión expirada"));
        }

        try {
            RefreshTokenService.TokenRotado tokenRotado = refreshTokenService.rotarToken(refreshToken);
            UsersModel usuario = tokenRotado.sesion().getUsuario();
            String accessToken = jwtUtils.generateAccesToken(
                    usuario.getUserAcces(),
                    obtenerAuthorities(usuario),
                    tokenRotado.sesion().getIdSesion());

            jwtCookieService.agregarAccessToken(response, accessToken);
            jwtCookieService.agregarRefreshToken(response, tokenRotado.token());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            jwtCookieService.limpiarTokens(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sesión expirada"));
        }
    }

    private String obtenerCookie(HttpServletRequest request, String nombre) {
        if (request.getCookies() == null) return null;
        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            if (nombre.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    private List<GrantedAuthority> obtenerAuthorities(UsersModel usuario) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        usuario.getRoles().stream()
                .filter(rol -> rol.isState())
                .forEach(rol -> {
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                            "ROLE_" + rol.getName_role()));
                    rol.getPermisos().stream()
                            .filter(permiso -> permiso.isEstado())
                            .map(permiso -> new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                    permiso.getCodigo()))
                            .forEach(authorities::add);
                });
        return authorities;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            // ✅ Extraer roles como array de strings
            List<String> authorities = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            List<String> roles = authorities.stream()
                    .filter(authority -> authority.startsWith("ROLE_"))
                    .collect(Collectors.toList());
            List<String> permissions = authorities.stream()
                    .filter(authority -> !authority.startsWith("ROLE_"))
                    .collect(Collectors.toList());

            Map<String, Object> userData = new HashMap<>();
            userData.put("username", auth.getName());
            userData.put("roles", roles);
            userData.put("permissions", permissions);
            System.out.println("✅ Usuario autenticado: " + auth.getName());
            System.out.println("✅ Roles: " + roles);

            return ResponseEntity.ok(userData);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "No autenticado"));
    }

    @PostMapping("/reset-email")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Gerente')")
    public ResponseEntity<Map<String, String>> resetEmail(@RequestBody Map<String, Object> request) {
        Map<String, String> response = new HashMap<>();

        Long userId = Long.valueOf(request.get("userId").toString());
        String newEmail = request.get("newEmail").toString();

        Optional<UsersModel> userOpt = usersRepository.findById(userId);

        if (userOpt.isEmpty()) {
            response.put("error", "Usuario no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Verificar que el nuevo email no esté en uso
        if (usersRepository.existsByUserAcces(newEmail)) {
            response.put("error", "El correo ya está en uso");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        UsersModel user = userOpt.get();
        user.setUserAcces(newEmail);
        usersRepository.save(user);

        response.put("message", "Correo actualizado correctamente");
        return ResponseEntity.ok(response);
    }

}
