package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Location.CreateLocationRequest;
import com.FastFoodDelivery.dto.response.Location.LocationResponse;
import com.FastFoodDelivery.entity.Location;
import com.FastFoodDelivery.exception.BadRequestException;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.DroneRepository;
import com.FastFoodDelivery.repository.LocationRepository;
import com.FastFoodDelivery.service.LocationService;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class LocationServiceImpl implements LocationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final DroneRepository droneRepository;
    private final LocationRepository locationRepository;

    private static final String LOCATION_KEY_PREFIX = "drone:location:";
    private static final long LOCATION_EXPIRY_MINUTE = 10; // Expire sau 10 phut - Neu drone ko update location

    public LocationServiceImpl(
            RedisTemplate<String, Object> redisTemplate,
            SimpMessagingTemplate messagingTemplate,
            DroneRepository droneRepository,
            LocationRepository locationRepository) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.droneRepository = droneRepository;
        this.locationRepository = locationRepository;
        
        log.info("🔧 LocationServiceImpl initialized");
        log.info("📡 SimpMessagingTemplate: {}", messagingTemplate != null ? "INJECTED ✅" : "NULL ❌");
        log.info("🗄️ RedisTemplate: {}", redisTemplate != null ? "INJECTED ✅" : "NULL ❌");
    }

    @Override
    public LocationResponse updateDroneLocation(CreateLocationRequest request) {
        log.info("🚁 [START] Update drone location - DroneId: {}", request.getDroneId());
        
        // 1️⃣ Validate input
        validateLocationRequest(request);
        log.debug("✅ Validation passed");
        
        // 2️⃣ Kiểm tra drone có tồn tại không
        droneRepository.findById(request.getDroneId())
                .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", request.getDroneId().toString()));
        log.debug("✅ Drone exists in database");

        // 3️⃣ Tạo Location entity để lưu vào MongoDB
        Location location = new Location();
        location.setDroneId(request.getDroneId());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setRecordedAt(new Date());
        location.setTimestamp(Instant.now().toEpochMilli());

        // 4️⃣ Lưu vào MongoDB (lịch sử vị trí)
        location = locationRepository.save(location);
        log.info("✅ Saved to MongoDB - LocationId: {}", location.getLocationId());

        // 5️⃣ Convert sang response
        LocationResponse response = LocationResponse.fromEntity(location);
        log.debug("✅ Converted to LocationResponse");

        // 6️⃣ Lưu vào Redis (vị trí hiện tại) với expiry time
        String key = LOCATION_KEY_PREFIX + request.getDroneId().toString();
        redisTemplate.opsForValue().set(key, response, LOCATION_EXPIRY_MINUTE, TimeUnit.MINUTES);
        log.info("✅ Cached to Redis - Key: {}", key);

        // 7️⃣ Gửi realtime tới các client subscribe WebSocket
        String destination = "/topic/drone/" + request.getDroneId().toString();
        log.info("📡 [WEBSOCKET] Attempting to send message to: {}", destination);
        log.debug("📡 [WEBSOCKET] Message content: {}", response);
        
        try {
            messagingTemplate.convertAndSend(destination, response);
            log.info("✅✅✅ [WEBSOCKET] Message sent successfully to: {}", destination);
        } catch (Exception e) {
            log.error("❌❌❌ [WEBSOCKET] Failed to send message: {}", e.getMessage(), e);
        }

        log.info("🚁 [END] Update drone location completed");
        return response;
    }

    @Override
    public LocationResponse getDroneLocation(String droneId) {
        // 1️⃣ Validate droneId
        if (droneId == null || droneId.isEmpty()) {
            throw new BadRequestException("Drone ID cannot be empty");
        }

        // 2️⃣ Tạo key để lấy từ Redis
        String key = LOCATION_KEY_PREFIX + droneId;

        // 3️⃣ Lấy location từ Redis
        Object locationObj = redisTemplate.opsForValue().get(key);

        // 4️⃣ Nếu không tìm thấy trong Redis, lấy location mới nhất từ MongoDB
        if (locationObj == null) {
            // Kiểm tra drone có tồn tại không
            if (!ObjectId.isValid(droneId)) {
                throw new BadRequestException("Invalid Drone ID format");
            }
            
            ObjectId droneObjectId = new ObjectId(droneId);
            droneRepository.findById(droneObjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", droneId));

            // Lấy location mới nhất từ DB
            Location location = locationRepository.findTopByDroneIdOrderByTimestampDesc(droneObjectId)
                    .orElse(null);
            
            if (location == null) {
                return null; // Drone chưa có location nào
            }

            LocationResponse response = LocationResponse.fromEntity(location);
            
            // Cache lại vào Redis
            redisTemplate.opsForValue().set(key, response, LOCATION_EXPIRY_MINUTE, TimeUnit.MINUTES);
            
            return response;
        }

        // 5️⃣ Cast về LocationResponse và return
        return (LocationResponse) locationObj;
    }

    /**
     * Validate location request
     */
    private void validateLocationRequest(CreateLocationRequest request) {
        if (request.getDroneId() == null) {
            throw new BadRequestException("Drone ID is required");
        }

        // Validate latitude (-90 to 90)
        if (request.getLatitude() < -90 || request.getLatitude() > 90) {
            throw new BadRequestException("Latitude must be between -90 and 90");
        }

        // Validate longitude (-180 to 180)
        if (request.getLongitude() < -180 || request.getLongitude() > 180) {
            throw new BadRequestException("Longitude must be between -180 and 180");
        }
    }
}
