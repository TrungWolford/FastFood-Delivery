package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.FastFoodDelivery.dto.request.Restaurant.CreateRestaurantRequest;
import com.FastFoodDelivery.dto.request.Restaurant.UpdateRestaurantRequest;
import com.FastFoodDelivery.dto.response.Restaurant.RestaurantResponse;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.RestaurantService;
import com.FastFoodDelivery.util.ValidationUtil;

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
    public Optional<Restaurant> getRestaurantEntityById(ObjectId restaurantId) {
        return restaurantRepository.findById(restaurantId);
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByOwnerId(ObjectId ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCity(city)
                .stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByCityAndDistrict(String city, String district) {
        return restaurantRepository.findByCityAndDistrict(city, district)
                .stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public List<RestaurantResponse> getRestaurantsByStatus(int status) {
        return restaurantRepository.findByStatus(status)
                .stream()
                .map(RestaurantResponse::fromEntity)
                .toList();
    }

    @Override
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        // Validate ownerId có tồn tại không
        validationUtil.validateUser(request.getOwnerId());

        // Validate trùng số điện thoại
        validationUtil.validateUniquePhone(request.getPhone());

        Restaurant restaurant = new Restaurant();
        restaurant.setOwnerId(request.getOwnerId());
        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setDistrict(request.getDistrict());
        restaurant.setPhone(request.getPhone());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        restaurant.setAvatarImage(request.getAvatarImage());
        restaurant.setRating(0.0);
        restaurant.setStatus(1);  // Active by default
        restaurant.setCreatedAt(new Date());
        restaurant.setUpdatedAt(new Date());

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
        if (request.getRestaurantName() != null) {
            restaurant.setRestaurantName(request.getRestaurantName());
        }
        if (request.getAddress() != null) {
            restaurant.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            restaurant.setCity(request.getCity());
        }
        if (request.getDistrict() != null) {
            restaurant.setDistrict(request.getDistrict());
        }
        if (request.getLatitude() > 0) {
            restaurant.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() > 0) {
            restaurant.setLongitude(request.getLongitude());
        }
        if (request.getAvatarImage() != null) {
            restaurant.setAvatarImage(request.getAvatarImage());
        }

        restaurant.setUpdatedAt(new Date());
        restaurantRepository.save(restaurant);

        return RestaurantResponse.fromEntity(restaurant);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return restaurantRepository.existsByPhone(phone);
    }

    @Override
    public void deleteRestaurant(ObjectId restaurantId) {
        validationUtil.validateRestaurant(restaurantId);
        restaurantRepository.deleteById(restaurantId);
    }
}
