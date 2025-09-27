package com.FastFoodDelivery.util;

import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.exception.BadRequestException;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.repository.RoleRepository;
import com.FastFoodDelivery.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class ValidationUtil {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final RoleRepository roleRepository;

    // Regex patterns
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^(\\+84|84|0)[1-9][0-9]{8}$"
    );

    public ValidationUtil(UserRepository userRepository,
                          RestaurantRepository restaurantRepository,
                          MenuItemRepository menuItemRepository,
                          RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.roleRepository = roleRepository;
    }

    // Validate User
    public void validateUser(ObjectId userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId.toString());
        }
    }

    // Validate Role
    public void validateRole(ObjectId roleId) {
        if (roleId == null) {
            throw new BadRequestException("RoleId must not be null");
        }
        if (!roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Role", "id", roleId.toString());
        }
    }

    // Validate Restaurant
    public void validateRestaurant(ObjectId restaurantId) {
        if (restaurantId == null) {
            throw new BadRequestException("RestaurantId must not be null");
        }
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", "id", restaurantId.toString());
        }
    }

    public void validateMenuItem(ObjectId itemId) {
        if (!menuItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("MenuItem", "id", itemId.toString());
        }
    }

    // Email validation
    public void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email must not be empty");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BadRequestException("Email format is invalid");
        }
    }

    // Phone validation
    public void validatePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new BadRequestException("Phone must not be empty");
        }
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BadRequestException("Phone format is invalid. Please use Vietnamese phone number format");
        }
    }

    // Unique email validation
    public void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }
    }

    // Unique email validation for update (exclude current user)
    public void validateUniqueEmailForUpdate(String email, ObjectId userId) {
        if (userRepository.existsByEmail(email)) {
            // Check if the email belongs to the current user being updated
            User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
            if (!email.equals(existingUser.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
        }
    }

    // Unique phone validation
    public void validateUniquePhone(String phone) {
        if (userRepository.existsByPhone(phone)) {
            throw new BadRequestException("Phone number already exists");
        }
    }

    // Unique phone validation for update (exclude current user)
    public void validateUniquePhoneForUpdate(String phone, ObjectId userId) {
        if (userRepository.existsByPhone(phone)) {
            // Check if the phone belongs to the current user being updated
            User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
            if (!phone.equals(existingUser.getPhone())) {
                throw new BadRequestException("Phone number already exists");
            }
        }
    }

    public void validateUniquePhoneRestaurant(String phone) {
        if (restaurantRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Số điện thoại đã được đăng ký cho nhà hàng khác.");
        }
    }

    public void validatePositive(double value, String fieldName) {
        if (value <= 0) {
            throw new BadRequestException(fieldName + " must be greater than 0");
        }
    }

    public void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(fieldName + " must not be empty");
        }
    }
}
