package com.example.urban_signs.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.config.Browser.BrowserDetector;
import com.example.urban_signs.config.filters.JwtAuthenticationFilter;
import com.example.urban_signs.config.filters.JwtAuthorizationFilter;
import com.example.urban_signs.config.jwt.JwtUtils;
import com.example.urban_signs.ServicesImpl.LoginAttemptService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.DispatcherType;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4200,http://localhost:4201}")
    private String[] allowedOrigins;

    private final JwtUtils jwtUtils;
    private final JwtAuthorizationFilter authorizationFilter;
    private final UsersRepository usersRepository;
    private final SessionRepository sesionRepository;
    private final BrowserDetector browserDetector;
    private final com.example.urban_signs.Services.RefreshTokenService refreshTokenService;
    private final JwtCookieService jwtCookieService;
    private final LoginAttemptService loginAttemptService;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager)
            throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(
                jwtUtils, usersRepository, sesionRepository, browserDetector, refreshTokenService, jwtCookieService,
                loginAttemptService, objectMapper);
        jwtAuthenticationFilter.setAuthenticationManager(authenticationManager);
        jwtAuthenticationFilter.setFilterProcessesUrl("/v1/user/login");

        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    auth.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll();
                    auth.requestMatchers("/error").permitAll();
                    // Rutas públicas
                    auth.requestMatchers("/v1/user/login").permitAll();
                    auth.requestMatchers("/users/send-code", "/users/verify-code", "/portal/registro", "/portal/servicios/**").permitAll();
                    auth.requestMatchers("/users/refresh").permitAll();
                    auth.requestMatchers("/users/verificar-email-recuperacion/**").permitAll();
                    auth.requestMatchers("/users/enviar-codigo-recuperacion").permitAll();
                    auth.requestMatchers("/users/verify-recovery-code").permitAll();
                    auth.requestMatchers("/users/reset-password").permitAll();
                    auth.requestMatchers("/ws/**").permitAll();

                    auth.requestMatchers("/users/logout").permitAll();
                    auth.requestMatchers("/users/me").authenticated();
                    auth.requestMatchers("/facturacion/**").authenticated();
                    auth.anyRequest().authenticated();
                })
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration corsConfig = new CorsConfiguration();
                    corsConfig.setAllowedOriginPatterns(Arrays.asList(allowedOrigins));
                    corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(Arrays.asList("Content-Type", "Accept", "Authorization"));
                    corsConfig.setExposedHeaders(Arrays.asList("Set-Cookie", "Retry-After"));
                    corsConfig.setAllowCredentials(true);
                    corsConfig.setMaxAge(3600L);
                    return corsConfig;
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ Orden correcto: primero autenticación, luego autorización
                .addFilter(jwtAuthenticationFilter)
                .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class)

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "No autorizado");
                            error.put("message", authException.getMessage());
                            error.put("path", request.getRequestURI());
                            response.getWriter().write(new ObjectMapper().writeValueAsString(error));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Acceso denegado");
                            error.put("message", "No tienes permisos para acceder a este recurso");
                            error.put("path", request.getRequestURI());
                            response.getWriter().write(new ObjectMapper().writeValueAsString(error));
                        }))
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    AuthenticationManager authenticationManager(HttpSecurity httpSecurity,
            UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = httpSecurity
                .getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);
        return authenticationManagerBuilder.build();
    }

    /*
     * public static void main(String[]args){
     * System.out.println(new
     * BCryptPasswordEncoder().encode("12345"));
     * }
     */

}
