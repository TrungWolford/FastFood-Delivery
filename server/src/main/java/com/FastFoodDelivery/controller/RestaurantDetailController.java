package com.FastFoodDelivery.controller;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.FastFoodDelivery.dto.request.RestaurantDetail.CreateRestaurantDetailRequest;
import com.FastFoodDelivery.dto.request.RestaurantDetail.UpdateRestaurantDetailRequest;
import com.FastFoodDelivery.dto.response.RestaurantDetail.RestaurantDetailResponse;
import com.FastFoodDelivery.entity.RestaurantDetail;
import com.FastFoodDelivery.service.RestaurantDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurant-details")
@RequiredArgsConstructor
public class RestaurantDetailController {
    
    private final RestaurantDetailService service;
    
    // Create restaurant detail
    @PostMapping("/{restaurantId}")
    public ResponseEntity<RestaurantDetailResponse> createRestaurantDetail(
            @PathVariable String restaurantId,
            @RequestBody CreateRestaurantDetailRequest request) {
        try {
            RestaurantDetail entity = new RestaurantDetail();
            entity.setOpeningHours(request.getOpeningHours());
            entity.setRestaurantTypes(request.getRestaurantTypes());
            entity.setCuisines(request.getCuisines());
            entity.setSpecialties(request.getSpecialties());
            entity.setDescription(request.getDescription());
            entity.setCoverImage(request.getCoverImage());
            entity.setMenuImages(request.getMenuImages());
            
            RestaurantDetail result = service.createRestaurantDetail(new ObjectId(restaurantId), entity);
            return new ResponseEntity<>(RestaurantDetailResponse.fromEntity(result), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get by restaurantId
    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantDetailResponse> getByRestaurantId(@PathVariable String restaurantId) {
        try {
            return service.getByRestaurantId(new ObjectId(restaurantId))
                    .map(entity -> ResponseEntity.ok(RestaurantDetailResponse.fromEntity(entity)))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Update restaurant detail
    @PutMapping("/{restaurantDetailId}")
    public ResponseEntity<RestaurantDetailResponse> updateRestaurantDetail(
            @PathVariable String restaurantDetailId,
            @RequestBody UpdateRestaurantDetailRequest request) {
        try {
            RestaurantDetail existing = service.getById(new ObjectId(restaurantDetailId))
                    .orElseThrow(() -> new IllegalArgumentException("Restaurant detail not found"));
            
            existing.setOpeningHours(request.getOpeningHours());
            existing.setRestaurantTypes(request.getRestaurantTypes());
            existing.setCuisines(request.getCuisines());
            existing.setSpecialties(request.getSpecialties());
            existing.setDescription(request.getDescription());
            existing.setCoverImage(request.getCoverImage());
            existing.setMenuImages(request.getMenuImages());
            
            RestaurantDetail result = service.updateRestaurantDetail(existing);
            return ResponseEntity.ok(RestaurantDetailResponse.fromEntity(result));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Delete by restaurantId
    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<Void> deleteByRestaurantId(@PathVariable String restaurantId) {
        try {
            service.deleteByRestaurantId(new ObjectId(restaurantId));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
