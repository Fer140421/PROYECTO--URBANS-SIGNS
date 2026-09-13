package com.example.urban_signs.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class JwtCookieService {
    public static final String ACCESS_TOKEN_COOKIE = "jwt-token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh-token";

    @Value("${jwt.time.expiration}")
    private long accessExpirationMs;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpirationMs;

    @Value("${jwt.cookies.secure}")
    private boolean secure;

    @Value("${jwt.cookies.same-site}")
    private String sameSite;

    public void agregarAccessToken(HttpServletResponse response, String token) {
        agregarCookie(response, ACCESS_TOKEN_COOKIE, token, accessExpirationMs / 1000);
    }

    public void agregarRefreshToken(HttpServletResponse response, String token) {
        agregarCookie(response, REFRESH_TOKEN_COOKIE, token, refreshExpirationMs / 1000);
    }

    public void limpiarTokens(HttpServletResponse response) {
        agregarCookie(response, ACCESS_TOKEN_COOKIE, "", 0);
        agregarCookie(response, REFRESH_TOKEN_COOKIE, "", 0);
    }

    private void agregarCookie(HttpServletResponse response, String nombre, String valor, long maxAge) {
        String secureAttribute = secure ? "; Secure" : "";
        response.addHeader("Set-Cookie", String.format(
                "%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=%s%s",
                nombre, valor, maxAge, sameSite, secureAttribute));
    }
}
