package com.example.urban_signs.config.filters;

import com.example.urban_signs.Utils.Context.SesionContextHolder;
import com.example.urban_signs.config.jwt.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = getTokenFromCookie(request);

            if (token != null && jwtUtils.isTokenValid(token)) {

                // ✅ PASO 1: Extraer datos del token
                String username = jwtUtils.getUsernameFromToken(token);
                List<String> roles = jwtUtils.getRolesFromToken(token);
                Long idSesion = jwtUtils.getIdSesionFromToken(token); // ✅ CRÍTICO

                // ✅ PASO 2: Establecer autenticación en SecurityContext
                List<GrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username,
                        null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // ✅ PASO 3: Guardar id_sesion en ThreadLocal
                // Este ID estará disponible durante TODO el request
                SesionContextHolder.setSesionId(idSesion);

                log.debug("Request autenticado - Usuario: {}, Sesión: {}", username, idSesion);
            }

            // Continuar con la cadena de filtros
            filterChain.doFilter(request, response);

        } finally {
            // ✅ PASO 4: CRÍTICO - Limpiar ThreadLocal al finalizar el request
            // Esto previene memory leaks y contaminación entre requests
            SesionContextHolder.clear();
            log.debug("ThreadLocal limpiado después del request");
        }
    }

    private String getTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if ("jwt-token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

}