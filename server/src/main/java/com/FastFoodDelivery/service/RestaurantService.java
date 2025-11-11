package com.FastFoodDelivery.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.FastFoodDelivery.dto.request.Restaurant.CreateRestaurantRequest;
import com.FastFoodDelivery.dto.request.Restaurant.UpdateRestaurantRequest;
import com.FastFoodDelivery.dto.response.Restaurant.RestaurantResponse;
import com.FastFoodDelivery.entity.Restaurant;

public interface RestaurantService {
    // Get all
    List<RestaurantResponse> getAllRestaurants();
    Page<RestaurantResponse> getAllRestaurants(Pageable pageable);
    
    // Get by ID
    RestaurantResponse getRestaurantById(ObjectId restaurantId);
    Optional<Restaurant> getRestaurantEntityById(ObjectId restaurantId);
    
    // Get by owner
    List<RestaurantResponse> getRestaurantsByOwnerId(ObjectId ownerId);
    
    // Get by location
    List<RestaurantResponse> getRestaurantsByCity(String city);
    List<RestaurantResponse> getRestaurantsByCityAndDistrict(String city, String district);
    
    // Get by status
    List<RestaurantResponse> getRestaurantsByStatus(int status);
    
    // Create/Update/Delete
    RestaurantResponse createRestaurant(CreateRestaurantRequest request);
    RestaurantResponse updateRestaurant(UpdateRestaurantRequest request, ObjectId restaurantId);
    RestaurantResponse changeStatus(ObjectId restaurantId, int status);
    void deleteRestaurant(ObjectId restaurantId);
    
    // Check exists
    boolean existsByPhone(String phone);
}
