package com.example.urban_signs.Controller;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.RefreshTokenService;
import com.example.urban_signs.ServicesImpl.LoginAttemptService;
import com.example.urban_signs.Utils.Enum.EstadoSession;
import com.example.urban_signs.config.Browser.BrowserDetector;
import com.example.urban_signs.config.JwtCookieService;
import com.example.urban_signs.config.jwt.JwtUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/portal/auth")
@RequiredArgsConstructor
public class PortalAuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UsersRepository usersRepository;
    private final SessionRepository sessionRepository;
    private final BrowserDetector browserDetector;
    private final RefreshTokenService refreshTokenService;
    private final JwtCookieService jwtCookieService;
    private final LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody UsersModel credenciales,
            HttpServletRequest request,
            HttpServletResponse response) {

        String userAcces = credenciales.getUserAcces();
        String passwordAcces = credenciales.getPasswordAcces();

        if (userAcces == null || userAcces.isBlank() || passwordAcces == null || passwordAcces.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Usuario y contraseña requeridos"));
        }

        // 1. Verificar bloqueo temporal por intentos fallidos
        Instant lockedUntil = loginAttemptService.getActiveLockUntil(userAcces);
        if (lockedUntil != null) {
            long minutesRemaining = Math.max(1, Duration.between(Instant.now(), lockedUntil).toMinutes() + 1);
            long retryAfterSeconds = Math.max(1, Duration.between(Instant.now(), lockedUntil).toSeconds());
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of(
                    "success", false,
                    "code", "ACCOUNT_TEMPORARILY_LOCKED",
                    "message", "Cuenta bloqueada temporalmente. Intenta nuevamente en " + minutesRemaining + " minuto(s).",
                    "lockedUntil", lockedUntil));
        }

        try {
            // 2. Autenticar credenciales
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userAcces, passwordAcces);
            Authentication authResult = authenticationManager.authenticate(authenticationToken);

            User user = (User) authResult.getPrincipal();

            // 3. Validar que la cuenta tenga acceso al portal de clientes (ROLE_Cliente)
            boolean isCliente = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_Cliente"));

            if (!isCliente) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "Esta cuenta no tiene perfil de cliente para acceder al portal."));
            }

            loginAttemptService.resetAttempts(user.getUsername());

            // 4. Registrar sesión en base de datos
            String userAgent = request.getHeader("User-Agent");
            BrowserDetector.BrowserInfo browserInfo = browserDetector.getBrowserInfo(userAgent);

            UsersModel usuarioEntity = usersRepository.findByUserAcces(user.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            SesionModel sesion = new SesionModel();
            sesion.setUsuario(usuarioEntity);
            sesion.setLoginInicio(LocalDateTime.now());
            sesion.setIpDireccion(getClientIp(request));
            sesion.setDispositivo(browserInfo.toString());
            sesion.setEstado(EstadoSession.ACTIVO);

            SesionModel sesionGuardada = sessionRepository.save(sesion);
            Long idSesion = sesionGuardada.getIdSesion();

            // 5. Generar tokens y asignar cookies exclusivas del portal (portal-jwt-token)
            String token = jwtUtils.generateAccesToken(user.getUsername(), user.getAuthorities(), idSesion);
            String refreshToken = refreshTokenService.crearToken(sesionGuardada);

            jwtCookieService.agregarPortalAccessToken(response, token);
            jwtCookieService.agregarPortalRefreshToken(response, refreshToken);

            Map<String, Object> httpResponse = new HashMap<>();
            httpResponse.put("success", true);
            httpResponse.put("message", "Autenticación de cliente exitosa");
            httpResponse.put("usuario", user.getUsername());

            return ResponseEntity.ok(httpResponse);

        } catch (AuthenticationException e) {
            Instant nuevoBloqueo = loginAttemptService.registerFailedAttempt(userAcces);
            if (nuevoBloqueo != null) {
                long minutesRemaining = Math.max(1, Duration.between(Instant.now(), nuevoBloqueo).toMinutes() + 1);
                long retryAfterSeconds = Math.max(1, Duration.between(Instant.now(), nuevoBloqueo).toSeconds());
                response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
                return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of(
                        "success", false,
                        "code", "ACCOUNT_TEMPORARILY_LOCKED",
                        "message", "Cuenta bloqueada por múltiples intentos. Intenta en " + minutesRemaining + " minuto(s).",
                        "lockedUntil", nuevoBloqueo));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Correo o contraseña incorrectos"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = obtenerCookie(request, JwtCookieService.PORTAL_REFRESH_TOKEN_COOKIE);

        if (refreshToken == null) {
            jwtCookieService.limpiarPortalTokens(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sesión de portal expirada"));
        }

        try {
            RefreshTokenService.TokenRotado tokenRotado = refreshTokenService.rotarToken(refreshToken);
            UsersModel usuario = tokenRotado.sesion().getUsuario();

            List<GrantedAuthority> authorities = new ArrayList<>();
            usuario.getRoles().stream()
                    .filter(rol -> rol.isState())
                    .forEach(rol -> authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + rol.getName_role())));

            String accessToken = jwtUtils.generateAccesToken(
                    usuario.getUserAcces(),
                    authorities,
                    tokenRotado.sesion().getIdSesion());

            jwtCookieService.agregarPortalAccessToken(response, accessToken);
            jwtCookieService.agregarPortalRefreshToken(response, tokenRotado.token());

            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            jwtCookieService.limpiarPortalTokens(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sesión de portal expirada"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = obtenerCookie(request, JwtCookieService.PORTAL_REFRESH_TOKEN_COOKIE);

        if (refreshToken != null) {
            refreshTokenService.revocarToken(refreshToken).ifPresent(sesion -> {
                sesion.setLoginFin(LocalDateTime.now());
                sesion.setEstado(EstadoSession.CERRADO);
                sessionRepository.save(sesion);
            });
        }

        jwtCookieService.limpiarPortalTokens(response);

        return ResponseEntity.ok(Map.of("success", true, "message", "Sesión de cliente cerrada"));
    }

    private String obtenerCookie(HttpServletRequest request, String nombre) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (nombre.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
