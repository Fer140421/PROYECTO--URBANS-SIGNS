package com.example.urban_signs.config.webSocket;

import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import com.example.urban_signs.config.jwt.JwtUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
 private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("🔵 WebSocket CONNECT recibido");

            // Obtener el token de las cookies
            String token = getTokenFromHeaders(accessor);

            if (token != null && jwtUtils.isTokenValid(token)) {
                String username = jwtUtils.getUsernameFromToken(token);
                log.info("✅ Token válido para usuario: {}", username);

                // Cargar los detalles del usuario
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Crear autenticación
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Establecer en el contexto de Spring Security
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Guardar en el accessor para usarlo en los handlers
                accessor.setUser(authentication);
                
                log.info("✅ Usuario autenticado en WebSocket: {}", username);
            } else {
                log.warn("❌ Token inválido o ausente en WebSocket");
                throw new IllegalArgumentException("Token JWT inválido o ausente");
            }
        }

        return message;
    }

    /**
     * Extrae el token JWT de las cabeceras del mensaje
     */
    private String getTokenFromHeaders(StompHeaderAccessor accessor) {
        // Intentar obtener de las cookies en la cabecera nativa
        String cookie = accessor.getFirstNativeHeader("cookie");
        
        if (cookie != null) {
            // Buscar jwt-token en las cookies
            String[] cookies = cookie.split(";");
            for (String c : cookies) {
                c = c.trim();
                if (c.startsWith("jwt-token=")) {
                    String token = c.substring("jwt-token=".length());
                    log.info("🔑 Token JWT encontrado en cookie");
                    return token;
                }
            }
        }

        log.warn("⚠️ No se encontró token JWT en las cookies");
        return null;
    }
}
