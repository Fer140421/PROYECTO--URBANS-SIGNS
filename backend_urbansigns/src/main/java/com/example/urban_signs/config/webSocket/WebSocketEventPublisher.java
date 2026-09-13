package com.example.urban_signs.config.webSocket;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Tipos de eventos del sistema
     */
    public enum EventType {
        // Categorías
        CATEGORY_CREATED,
        CATEGORY_UPDATED,
        CATEGORY_DELETED,
        CATEGORY_STATUS_CHANGED,
        
        // Notificaciones generales
        NOTIFICATION,
        SYSTEM_ALERT,
        
        // Puedes agregar más tipos según tus necesidades
        PRODUCT_CREATED,
        PRODUCT_UPDATED,
        ORDER_CREATED,
        USER_ACTIVITY
    }

    /**
     * Enviar evento a todos los usuarios conectados
     */
    public void publishToAll(EventType eventType, Object data) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .type(eventType.name())
                    .data(data)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

            messagingTemplate.convertAndSend("/topic/events", message);
            log.info("✅ Evento {} publicado a todos los usuarios", eventType);
        } catch (Exception e) {
            log.error("❌ Error publicando evento {}: {}", eventType, e.getMessage());
        }
    }

    /**
     * Enviar evento a un usuario específico
     */
    public void publishToUser(String username, EventType eventType, Object data) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .type(eventType.name())
                    .data(data)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

            messagingTemplate.convertAndSendToUser(username, "/queue/events", message);
            log.info("✅ Evento {} enviado a usuario: {}", eventType, username);
        } catch (Exception e) {
            log.error("❌ Error enviando evento a {}: {}", username, e.getMessage());
        }
    }

    /**
     * Enviar notificación general
     */
    public void sendNotification(String title, String message, String severity) {
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("title", title);
        notificationData.put("message", message);
        notificationData.put("severity", severity); // info, success, warning, error
        
        publishToAll(EventType.NOTIFICATION, notificationData);
    }

    /**
     * Enviar notificación a usuario específico
     */
    public void sendNotificationToUser(String username, String title, String message, String severity) {
        Map<String, Object> notificationData = new HashMap<>();
        notificationData.put("title", title);
        notificationData.put("message", message);
        notificationData.put("severity", severity);
        
        publishToUser(username, EventType.NOTIFICATION, notificationData);
    }

    /**
     * Clase interna para estructura de mensajes WebSocket
     */
    @lombok.Data
    @lombok.Builder
    public static class WebSocketMessage {
        private String type;
        private Object data;
        private String timestamp;
    }
}