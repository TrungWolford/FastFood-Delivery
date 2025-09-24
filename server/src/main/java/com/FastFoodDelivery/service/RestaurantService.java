package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Restaurant.CreateRestaurantRequest;
import com.FastFoodDelivery.dto.request.Restaurant.UpdateRestaurantRequest;
import com.FastFoodDelivery.dto.response.Restaurant.RestaurantResponse;
import com.FastFoodDelivery.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Optional;

public interface RestaurantService {
    List<RestaurantResponse> getAllRestaurants();
    Page<RestaurantResponse> getAllRestaurants(Pageable pageable);
    RestaurantResponse getRestaurantById(ObjectId restaurantId);
    List<RestaurantResponse> getRestaurantsByOwnerId(ObjectId ownerId);
    RestaurantResponse createRestaurant(CreateRestaurantRequest request);
    RestaurantResponse updateRestaurant(UpdateRestaurantRequest request, ObjectId restaurantId);
    void deleteRestaurant(ObjectId restaurantId);
}
