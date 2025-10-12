package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Drone.CreateDroneRequest;
import com.FastFoodDelivery.dto.request.Drone.UpdateDroneRequest;
import com.FastFoodDelivery.dto.response.Drone.DroneResponse;
import com.FastFoodDelivery.service.DroneService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drones")
public class DroneController {
    @Autowired
    private DroneService droneService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<DroneResponse>> getAllDronesByRestaurant(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable ObjectId restaurantId){
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(droneService.getAllDroneByRestaurantId(pageable, restaurantId));
    }

    @GetMapping("/{droneId}")
    public ResponseEntity<DroneResponse> getDroneById(@PathVariable ObjectId droneId){
        return ResponseEntity.ok(droneService.getByDroneId(droneId));
    }

    @PostMapping
    public ResponseEntity<DroneResponse> createDrone(@RequestBody @Valid CreateDroneRequest request){
        return ResponseEntity.ok(droneService.createDrone(request));
    }

    @PutMapping("/{droneId}")
    public ResponseEntity<DroneResponse> updateDrone(@RequestBody @Valid UpdateDroneRequest request, @PathVariable ObjectId droneId){
        return ResponseEntity.ok(droneService.updateDrone(request, droneId));
    }

    @PatchMapping("/{droneId}/status")
    public ResponseEntity<String> changeStatus(@PathVariable ObjectId droneId){
        droneService.changeStatus(droneId);
        return ResponseEntity.ok("Change status successfully");
    }

}
