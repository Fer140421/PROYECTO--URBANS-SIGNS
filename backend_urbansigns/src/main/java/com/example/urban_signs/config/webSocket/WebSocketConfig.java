package com.example.urban_signs.config.webSocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitar broker simple para enviar mensajes a clientes suscritos
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefijo para mensajes desde el cliente al servidor
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefijo para mensajes dirigidos a usuarios específicos
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:4200")
                .withSockJS(); // Soporte para navegadores sin WebSocket nativo
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // ✅ Registrar el interceptor de autenticación
        registration.interceptors(webSocketAuthInterceptor);
    }
}
