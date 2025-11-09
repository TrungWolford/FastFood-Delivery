package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Restaurant.CreateRestaurantRequest;
import com.FastFoodDelivery.dto.request.Restaurant.UpdateRestaurantRequest;
import com.FastFoodDelivery.dto.response.Restaurant.RestaurantResponse;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.RestaurantService;
import com.FastFoodDelivery.util.ValidationUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ValidationUtil validationUtil;

    @Override
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
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
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Restaurant", "id", restaurantId.toString()));

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByOwnerId(ObjectId ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        // Convert String ownerId to ObjectId
        ObjectId ownerObjectId = new ObjectId(request.getOwnerId());
        
        // Validate ownerId có tồn tại không
        validationUtil.validateUser(ownerObjectId);

        // Validate trùng số điện thoại
        validationUtil.validateUniquePhone(request.getPhone());

        Restaurant restaurant = new Restaurant();
        restaurant.setOwnerId(ownerObjectId);
        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setOpeningHours(request.getOpeningHours());
        restaurant.setDescription(request.getDescription());
        restaurant.setCreatedAt(new Date());
        restaurant.setUpdatedAt(new Date());
        restaurant.setStatus(1);

        restaurantRepository.save(restaurant);
        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public RestaurantResponse updateRestaurant(UpdateRestaurantRequest request, ObjectId restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Restaurant", "id", restaurantId.toString()));

        if (request.getRestaurantName() != null) {
            restaurant.setRestaurantName(request.getRestaurantName());
        }
        if (request.getAddress() != null) {
            restaurant.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            // Nếu update phone thì phải check unique
            if (!request.getPhone().equals(restaurant.getPhone())) {
                validationUtil.validateUniquePhone(request.getPhone());
            }
            restaurant.setPhone(request.getPhone());
        }
        if (request.getOpeningHours() != null) {
            restaurant.setOpeningHours(request.getOpeningHours());
        }
        if (request.getDescription() != null) {
            restaurant.setDescription(request.getDescription());
        }

        restaurant.setUpdatedAt(new Date());
        restaurantRepository.save(restaurant);

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public RestaurantResponse changeStatus(ObjectId restaurantId, int status) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Restaurant", "id", restaurantId.toString()));

        restaurant.setStatus(status);
        restaurant.setUpdatedAt(new Date());
        restaurantRepository.save(restaurant);

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public void deleteRestaurant(ObjectId restaurantId) {
        validationUtil.validateRestaurant(restaurantId);
        restaurantRepository.deleteById(restaurantId);
    }
}
