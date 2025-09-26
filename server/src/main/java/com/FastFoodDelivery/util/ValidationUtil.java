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

    public void validateUser(ObjectId userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId.toString());
        }
    }

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
}
