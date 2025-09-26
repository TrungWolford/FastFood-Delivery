package com.FastFoodDelivery.util;

import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;

@Component
public class ValidationUtil {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public ValidationUtil(UserRepository userRepository,
                          RestaurantRepository restaurantRepository,
                          MenuItemRepository menuItemRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    // Validate User
    public void validateUser(ObjectId userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId.toString());
        }
    }

    // Validate Restaurant
    public void validateRestaurant(ObjectId restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", "id", restaurantId.toString());
        }
    }

    public void validateMenuItem(ObjectId itemId) {
        if (!menuItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("MenuItem", "id", itemId.toString());
        }
    }


    public void validateUniquePhone(String phone) {
        if (restaurantRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Số điện thoại đã được đăng ký cho nhà hàng khác.");
        }
    }
}
