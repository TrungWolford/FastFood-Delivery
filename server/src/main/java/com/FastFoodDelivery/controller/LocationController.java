package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.response.Location.LocationResponse;
import com.FastFoodDelivery.service.LocationService;
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
     */
    @PostMapping
    public ResponseEntity<LocationResponse> updateDroneLocation(@RequestBody LocationResponse location) {
        LocationResponse updated = locationService.updateDroneLocation(location);
        return ResponseEntity.ok(updated);
    }

    /**
     * Lấy vị trí hiện tại của drone từ Redis
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
