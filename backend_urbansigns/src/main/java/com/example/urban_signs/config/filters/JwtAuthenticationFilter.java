package com.example.urban_signs.config.filters;

import com.example.urban_signs.Model.SesionModel;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Utils.Enum.EstadoSession;
import com.example.urban_signs.config.Browser.BrowserDetector;
import com.example.urban_signs.config.JwtCookieService;
import com.example.urban_signs.config.jwt.JwtUtils;
import com.example.urban_signs.Services.RefreshTokenService;
import com.example.urban_signs.ServicesImpl.LoginAttemptService;
import com.example.urban_signs.config.exception.AccountTemporarilyLockedException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final JwtUtils jwtUtils;
    private final UsersRepository usersRepository;
    private final SessionRepository sessionRepository;
    private final BrowserDetector browserDetector;
    private final RefreshTokenService refreshTokenService;
    private final JwtCookieService jwtCookieService;
    private final LoginAttemptService loginAttemptService;
    private final ObjectMapper objectMapper;

    private static final String LOGIN_USERNAME_ATTRIBUTE = "loginUsername";

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        try {
            UsersModel userEntity = objectMapper.readValue(request.getInputStream(), UsersModel.class);
            String userAcces = userEntity.getUserAcces();
            String passwordAcces = userEntity.getPasswordAcces();
            request.setAttribute(LOGIN_USERNAME_ATTRIBUTE, userAcces);

            Instant lockedUntil = loginAttemptService.getActiveLockUntil(userAcces);
            if (lockedUntil != null) {
                throw new AccountTemporarilyLockedException(lockedUntil);
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userAcces,
                    passwordAcces);

            return getAuthenticationManager().authenticate(authenticationToken);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el cuerpo del request", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain, Authentication authResult) throws IOException, ServletException {

        User user = (User) authResult.getPrincipal();
        loginAttemptService.resetAttempts(user.getUsername());

        // Obtener información del navegador
        String userAgent = request.getHeader("User-Agent");
        BrowserDetector.BrowserInfo browserInfo = browserDetector.getBrowserInfo(userAgent);

        UsersModel usuarioEntity = usersRepository.findByUserAcces(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // ✅ PASO 1: Guardar sesión en BD y obtener el ID
        SesionModel sesion = new SesionModel();
        sesion.setUsuario(usuarioEntity);
        sesion.setLoginInicio(LocalDateTime.now());
        sesion.setIpDireccion(getClientIp(request));
        sesion.setDispositivo(browserInfo.toString());
        sesion.setEstado(EstadoSession.ACTIVO);

        SesionModel sesionGuardada = sessionRepository.save(sesion);
        Long idSesion = sesionGuardada.getIdSesion(); // ✅ ID generado por la BD

        // ✅ PASO 2: Generar token JWT con id_sesion incluido
        String token = jwtUtils.generateAccesToken(
                user.getUsername(),
                user.getAuthorities(),
                idSesion // ✅ CRÍTICO: Se incluye en el token
        );

        String refreshToken = refreshTokenService.crearToken(sesionGuardada);
        jwtCookieService.agregarAccessToken(response, token);
        jwtCookieService.agregarRefreshToken(response, refreshToken);

        // Extraer roles
        List<String> authorities = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        List<String> roles = authorities.stream()
                .filter(authority -> authority.startsWith("ROLE_"))
                .collect(Collectors.toList());
        List<String> permissions = authorities.stream()
                .filter(authority -> !authority.startsWith("ROLE_"))
                .collect(Collectors.toList());

        // Respuesta JSON
        Map<String, Object> httpResponse = new HashMap<>();
        httpResponse.put("success", true);
        httpResponse.put("message", "Autenticación correcta");
        httpResponse.put("usuario", user.getUsername());
        httpResponse.put("roles", roles);
        httpResponse.put("permissions", permissions);

        response.setStatus(HttpStatus.OK.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(httpResponse));
        response.getWriter().flush();
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException, ServletException {
        Map<String, Object> httpResponse = new HashMap<>();
        httpResponse.put("success", false);
        httpResponse.put("message", "Credenciales inválidas");
        httpResponse.put("error", failed.getMessage());

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        if (failed instanceof AccountTemporarilyLockedException lockedException) {
            long minutesRemaining = Math.max(1,
                    Duration.between(Instant.now(), lockedException.getLockedUntil()).toMinutes() + 1);
            httpResponse.put("message", "Cuenta bloqueada temporalmente. Intenta nuevamente en " + minutesRemaining + " minuto(s).");
            httpResponse.put("lockedUntil", lockedException.getLockedUntil());
            long retryAfterSeconds = Math.max(1,
                    Duration.between(Instant.now(), lockedException.getLockedUntil()).toSeconds());
            httpResponse.put("code", "ACCOUNT_TEMPORARILY_LOCKED");
            httpResponse.put("retryAfterSeconds", retryAfterSeconds);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setStatus(HttpStatus.LOCKED.value());
        } else {
            String username = (String) request.getAttribute(LOGIN_USERNAME_ATTRIBUTE);
            if (username != null && !username.isBlank()) {
                Instant lockedUntil = loginAttemptService.registerFailedAttempt(username);
                if (lockedUntil != null) {
                    long minutesRemaining = Math.max(1,
                            Duration.between(Instant.now(), lockedUntil).toMinutes() + 1);
                    httpResponse.put("message", "Cuenta bloqueada temporalmente. Intenta nuevamente en " + minutesRemaining + " minuto(s).");
                    httpResponse.put("lockedUntil", lockedUntil);
                    long retryAfterSeconds = Math.max(1,
                            Duration.between(Instant.now(), lockedUntil).toSeconds());
                    httpResponse.put("code", "ACCOUNT_TEMPORARILY_LOCKED");
                    httpResponse.put("retryAfterSeconds", retryAfterSeconds);
                    response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
                    response.setStatus(HttpStatus.LOCKED.value());
                }
            }
        }
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(httpResponse));
        response.getWriter().flush();
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
