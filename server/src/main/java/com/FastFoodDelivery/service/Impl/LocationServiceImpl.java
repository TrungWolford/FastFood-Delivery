package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.response.Location.LocationResponse;
import com.FastFoodDelivery.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String LOCATION_KEY_PREFIX = "drone:location:";
    private static final long LOCATION_EXPIRY_MINUTE = 10; // Expire sau 10 phut - Neu drone ko update location

    @Override
    public LocationResponse updateDroneLocation(LocationResponse location) {
        // 1️⃣ Gán timestamp để tracking chính xác
        location.setTimestamp(Instant.now().toEpochMilli());

        // 2️⃣ Tạo key cho Redis
        String key = LOCATION_KEY_PREFIX + location.getDroneId();

        // 3️⃣ Lưu location vào Redis (dưới dạng Object, sẽ tự động serialize)
        // Set expire time để tự động xóa location cũ
        redisTemplate.opsForValue().set(key, location, LOCATION_EXPIRY_MINUTE, TimeUnit.MINUTES);

        // 4️⃣ Gửi realtime tới các client subscribe WebSocket
        // Client sẽ subscribe topic: /topic/drone/{droneId}
        messagingTemplate.convertAndSend("/topic/drone/" + location.getDroneId(), location);

        return location;
    }

    @Override
    public LocationResponse getDroneLocation(String droneId) {
        // 1️⃣ Tạo key để lấy từ Redis
        String key = LOCATION_KEY_PREFIX + droneId;

        // 2️⃣ Lấy location từ Redis
        Object locationObj = redisTemplate.opsForValue().get(key);

        // 3️⃣ Kiểm tra nếu không tìm thấy
        if (locationObj == null) {
            return null; // Hoặc throw exception nếu muốn
        }

        // 4️⃣ Cast về LocationResponse và return
        return (LocationResponse) locationObj;
    }
}
