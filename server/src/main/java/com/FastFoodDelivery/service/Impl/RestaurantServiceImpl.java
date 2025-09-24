package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Restaurant.CreateRestaurantRequest;
import com.FastFoodDelivery.dto.request.Restaurant.UpdateRestaurantRequest;
import com.FastFoodDelivery.dto.response.Restaurant.RestaurantResponse;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    public List<RestaurantResponse> getAllRestaurants() {

        return restaurantRepository.findAll().stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public Page<RestaurantResponse> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable)
                .map(RestaurantResponse::fromEntity);
    }

    @Override
    public RestaurantResponse getRestaurantById(ObjectId restaurantId) {
        Restaurant restaurant =  restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId.toString()));

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByOwnerId(ObjectId ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream().map(RestaurantResponse::fromEntity).toList();
    }

    @Override
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        Restaurant restaurant = new Restaurant();
        restaurant.setOwnerId(request.getOwnerId());
        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setOpeningHours(request.getOpeningHours());
        restaurant.setDescription(request.getDescription());
        restaurant.setCreatedAt(new Date());
        restaurant.setUpdatedAt(new Date());

        restaurantRepository.save(restaurant);

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public RestaurantResponse updateRestaurant(UpdateRestaurantRequest request, ObjectId restaurantId) {
        Restaurant restaurant =  restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId.toString()));

        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setOpeningHours(request.getOpeningHours());
        restaurant.setDescription(request.getDescription());
        restaurant.setUpdatedAt(new Date());
        restaurantRepository.save(restaurant);

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public void deleteRestaurant(ObjectId restaurantId) {
        restaurantRepository.deleteById(restaurantId);
    }
}
