package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import com.FastFoodDelivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {
    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<DeliveryResponse>> getALlDeliveriesByOrderId(@PathVariable ObjectId orderId){
        return ResponseEntity.ok(deliveryService.getALlDeliveriesByOrderId(orderId));
    }

    @GetMapping("/drone/{droneId}/restaurant/{restaurantId}")
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveriesByDroneIdAndRestaurantId(
            @PathVariable ObjectId droneId,
            @PathVariable ObjectId restaurantId) {
        return ResponseEntity.ok(deliveryService.getAllDeliveriesByDroneIdAndRestaurantId(droneId, restaurantId));
    }

    @GetMapping("/{deliveryId}")
    public ResponseEntity<DeliveryResponse> getByDeliveryId(@PathVariable ObjectId deliveryId){
        return ResponseEntity.ok(deliveryService.getByDeliveryId(deliveryId));
    }

    @PostMapping
    public ResponseEntity<DeliveryResponse> createDelivery(@Valid @RequestBody CreateDeliveryRequest request){
        return ResponseEntity.ok(deliveryService.createDelivery(request));
    }

    @PutMapping("/{deliveryId}")
    public ResponseEntity<DeliveryResponse> getByDeliveryId(@Valid @RequestBody UpdateDeliveryRequest request, @PathVariable ObjectId deliveryId){
        return ResponseEntity.ok(deliveryService.updateDelivery(request, deliveryId));
    }

    @PatchMapping("/{deliveryId}")
    public ResponseEntity<String> changeStatus(@Valid @RequestBody UpdateStatusDeliveryRequest request, @PathVariable ObjectId deliveryId){
        deliveryService.changeStatus(request, deliveryId);
        return ResponseEntity.ok("Change status successfully");
    }
}
