package com.FastFoodDelivery.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket mà client (Customer App) sẽ kết nối
        // Support cả WebSocket native và SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        log.info("✅ WebSocket STOMP endpoint registered: /ws");
        log.info("✅ SockJS fallback enabled");
        log.info("✅ Connection URL: ws://localhost:8080/ws (for native WebSocket)");
        log.info("✅ Connection URL: http://localhost:8080/ws (for SockJS)");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic" cho broadcast, "/app" cho gửi từ client lên server
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
        
        log.info("✅ Message broker configured:");
        log.info("   - Simple broker: /topic");
        log.info("   - App destination prefix: /app");
    }
}
