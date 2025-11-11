package com.FastFoodDelivery.service;

import java.util.Optional;

import org.bson.types.ObjectId;

import com.FastFoodDelivery.entity.RestaurantDetail;

public interface RestaurantDetailService {
    
    // Create
    RestaurantDetail createRestaurantDetail(ObjectId restaurantId, RestaurantDetail detail);
    
    // Get
    Optional<RestaurantDetail> getById(ObjectId restaurantDetailId);
    Optional<RestaurantDetail> getByRestaurantId(ObjectId restaurantId);
    
    // Update
    RestaurantDetail updateRestaurantDetail(RestaurantDetail detail);
    
    // Delete
    void deleteByRestaurantId(ObjectId restaurantId);
    void deleteById(ObjectId restaurantDetailId);
    
    // Check
    boolean existsByRestaurantId(ObjectId restaurantId);
}
