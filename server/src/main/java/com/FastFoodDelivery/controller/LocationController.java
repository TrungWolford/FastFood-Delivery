package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Location.CreateLocationRequest;
import com.FastFoodDelivery.dto.response.Location.LocationResponse;
import com.FastFoodDelivery.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    /**
     * Cập nhật vị trí của drone (realtime tracking)
     * POST /api/locations
     * Body: {
     *   "droneId": "68eb9e1235281411ad0f423c",
     *   "latitude": 10.762622,
     *   "longitude": 106.660172
     * }
     */
    @PostMapping
    public ResponseEntity<LocationResponse> updateDroneLocation(@RequestBody @Valid CreateLocationRequest request) {
        LocationResponse updated = locationService.updateDroneLocation(request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Lấy vị trí hiện tại của drone từ Redis (hoặc DB nếu không có trong cache)
     * GET /api/locations/drone/{droneId}
     */
    @GetMapping("/drone/{droneId}")
    public ResponseEntity<LocationResponse> getDroneLocation(@PathVariable String droneId) {
        LocationResponse location = locationService.getDroneLocation(droneId);
        
        if (location == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(location);
    }
}
