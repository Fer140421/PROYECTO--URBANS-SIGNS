package com.example.urban_signs.config.jwt;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;

import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtUtils {
    @Value("${jwt.secret.key}")
    private String secretkey;
    @Value("${jwt.time.expiration}")
    private String timeExpiration;

    public String generateAccesToken(String username, Collection<? extends GrantedAuthority> authorities,
            Long idSesion) {
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        List<String> permissions = roles.stream()
                .filter(authority -> !authority.startsWith("ROLE_"))
                .toList();

        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roles", roles);
        claims.put("permissions", permissions);
        claims.put("id_sesion", idSesion); // ✅ AGREGADO: ID de sesión en el token

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + Long.parseLong(timeExpiration)))
                .signWith(getSignatureKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignatureKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return true;
        } catch (ExpiredJwtException e) {
            log.error("Token expirado: " + e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Token inválido: " + e.getMessage());
            return false;
        }
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignatureKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T getClaim(String token, Function<Claims, T> claimsTFunction) {
        Claims claims = extractAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    // ✅ NUEVO: Método para extraer roles del token
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    public Long getIdSesionFromToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object idSesion = claims.get("id_sesion");

            if (idSesion == null) {
                log.warn("Token no contiene id_sesion");
                return null;
            }

            // JWT puede devolver Integer o Long dependiendo del tamaño
            if (idSesion instanceof Integer) {
                return ((Integer) idSesion).longValue();
            }

            return (Long) idSesion;
        } catch (Exception e) {
            log.error("Error al extraer id_sesion del token: {}", e.getMessage());
            return null;
        }
    }

    public Key getSignatureKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretkey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
