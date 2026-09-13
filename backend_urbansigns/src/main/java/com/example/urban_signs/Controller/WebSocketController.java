package com.example.urban_signs.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

     private final SimpMessagingTemplate messagingTemplate;

    /**
     * Endpoint público: Envía mensaje a todos los suscritos a /topic/public
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public Map<String, Object> sendMessage(@Payload Map<String, String> message, 
                                          SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        String username = auth != null ? auth.getName() : "Anónimo";
        
        log.info("📨 Mensaje recibido de {}: {}", username, message.get("content"));

        Map<String, Object> response = new HashMap<>();
        response.put("sender", username);
        response.put("content", message.get("content"));
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("type", "MESSAGE");
        
        return response;
    }

    /**
     * Notificación cuando un usuario se conecta
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public Map<String, Object> addUser(@Payload Map<String, String> message,
                                       SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        String username = auth != null ? auth.getName() : "Anónimo";
        
        log.info("✅ Usuario conectado: {}", username);

        Map<String, Object> response = new HashMap<>();
        response.put("sender", username);
        response.put("content", username + " se ha unido al chat");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("type", "JOIN");
        
        return response;
    }

    /**
     * Enviar mensaje privado a un usuario específico
     */
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload Map<String, String> message,
                                   Principal principal) {
        String sender = principal.getName();
        String recipient = message.get("recipient");
        String content = message.get("content");
        
        log.info("📨 Mensaje privado de {} a {}: {}", sender, recipient, content);

        Map<String, Object> response = new HashMap<>();
        response.put("sender", sender);
        response.put("content", content);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("type", "PRIVATE");

        // Enviar al destinatario específico
        messagingTemplate.convertAndSendToUser(
            recipient,
            "/queue/private",
            response
        );
    }

    /**
     * Notificar a todos sobre una actualización
     */
    public void notifyAll(String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("content", message);
        notification.put("timestamp", LocalDateTime.now().toString());
        notification.put("type", "NOTIFICATION");
        
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    /**
     * Notificar a un usuario específico
     */
    public void notifyUser(String username, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("content", message);
        notification.put("timestamp", LocalDateTime.now().toString());
        notification.put("type", "NOTIFICATION");
        
        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/notifications",
            notification
        );
    }
}
