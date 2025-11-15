package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Auth.LoginRequest;
import com.FastFoodDelivery.dto.response.Auth.LoginResponse;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.Role;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.repository.RoleRepository;
import com.FastFoodDelivery.repository.UserRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

/**
 * Authentication Controller
 * Handles login and authentication related endpoints
 */
@RestController
@RequestMapping("/api/account")
@Slf4j
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    /**
     * Login endpoint
     * POST /api/account/login
     * 
     * @param request LoginRequest with accountPhone and password
     * @return LoginResponse with user data if successful
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        log.info("Login attempt for phone: {}", request.getAccountPhone());
        
        try {
            // Find user by phone
            User user = userRepository.findByPhone(request.getAccountPhone())
                    .orElse(null);
            
            if (user == null) {
                log.warn("User not found with phone: {}", request.getAccountPhone());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(LoginResponse.builder()
                                .success(false)
                                .message("Số điện thoại hoặc mật khẩu không đúng")
                                .build());
            }
            
            // Check if account is active
            if (user.getStatus() == 0) {
                log.warn("Account is locked for phone: {}", request.getAccountPhone());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(LoginResponse.builder()
                                .success(false)
                                .message("Tài khoản đã bị khóa")
                                .build());
            }
            
            // Verify password (plain text comparison for now - should use BCrypt in production)
            if (!user.getPassword().equals(request.getPassword())) {
                log.warn("Invalid password for phone: {}", request.getAccountPhone());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(LoginResponse.builder()
                                .success(false)
                                .message("Số điện thoại hoặc mật khẩu không đúng")
                                .build());
            }
            
            // Get user role
            Role role = roleRepository.findById(user.getRoleId())
                    .orElse(null);
            
            if (role == null) {
                log.error("Role not found for roleId: {}", user.getRoleId());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(LoginResponse.builder()
                                .success(false)
                                .message("Lỗi hệ thống: Không tìm thấy vai trò người dùng")
                                .build());
            }
            
            // Get restaurant ID if user is a restaurant owner
            String restaurantId = null;
            List<Restaurant> restaurants = restaurantRepository.findByOwnerId(user.getUserID());
            if (!restaurants.isEmpty()) {
                restaurantId = restaurants.get(0).getRestaurantId().toString();
                log.info("Found restaurant ID: {} for user: {}", restaurantId, user.getUserID());
            }
            
            // Create UserResponse
            UserResponse userResponse = UserResponse.fromEntity(user, role, restaurantId);
            
            log.info("Login successful for phone: {}, role: {}", request.getAccountPhone(), role.getRoleName());
            
            // Return success response
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(true)
                    .message("Đăng nhập thành công")
                    .user(userResponse)
                    .build());
            
        } catch (Exception e) {
            log.error("Error during login for phone: {}", request.getAccountPhone(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("Có lỗi xảy ra: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Logout endpoint (optional)
     * POST /api/account/logout
     * 
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        log.info("User logged out");
        return ResponseEntity.ok("Đăng xuất thành công");
    }

    /**
     * Check authentication status (optional)
     * GET /api/account/me
     * 
     * @return Current user data
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestParam String phone) {
        Optional<User> userOpt = userRepository.findByPhone(phone);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        User user = userOpt.get();
        Role role = roleRepository.findById(user.getRoleId()).orElse(null);
        
        if (role == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        // Get restaurant ID if user is a restaurant owner
        String restaurantId = null;
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(user.getUserID());
        if (!restaurants.isEmpty()) {
            restaurantId = restaurants.get(0).getRestaurantId().toString();
        }
        
        UserResponse userResponse = UserResponse.fromEntity(user, role, restaurantId);
        return ResponseEntity.ok(userResponse);
    }
}
