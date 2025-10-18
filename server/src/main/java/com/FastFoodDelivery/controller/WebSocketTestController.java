package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.response.Location.LocationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;

/**
 * Controller để test WebSocket
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class WebSocketTestController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Test endpoint để kiểm tra WebSocket có hoạt động không
     * GET /api/test/websocket/{droneId}
     */
    @GetMapping("/websocket/{droneId}")
    public String testWebSocket(@PathVariable String droneId) {
        log.info("🧪 [TEST] Testing WebSocket for droneId: {}", droneId);
        
        try {
            // Tạo test message
            LocationResponse testMessage = new LocationResponse();
            testMessage.setDroneId(droneId);
            testMessage.setLatitude(10.762622);
            testMessage.setLongitude(106.660172);
            testMessage.setRecordedAt(new Date());
            testMessage.setTimestamp(Instant.now().toEpochMilli());
            
            String destination = "/topic/drone/" + droneId;
            
            log.info("📡 [TEST] Sending test message to: {}", destination);
            log.info("📡 [TEST] Message: {}", testMessage);
            
            messagingTemplate.convertAndSend(destination, testMessage);
            
            log.info("✅ [TEST] WebSocket message sent successfully!");
            return "✅ WebSocket test message sent to: " + destination;
            
        } catch (Exception e) {
            log.error("❌ [TEST] WebSocket test failed: {}", e.getMessage(), e);
            return "❌ WebSocket test failed: " + e.getMessage();
        }
    }

    /**
     * Kiểm tra SimpMessagingTemplate có được inject không
     * GET /api/test/websocket-status
     */
    @GetMapping("/websocket-status")
    public String checkWebSocketStatus() {
        boolean isInjected = messagingTemplate != null;
        log.info("🔍 [STATUS] SimpMessagingTemplate: {}", isInjected ? "INJECTED ✅" : "NULL ❌");
        
        return isInjected 
            ? "✅ SimpMessagingTemplate is properly injected and ready!"
            : "❌ SimpMessagingTemplate is NULL - WebSocket not configured properly!";
    }
}
