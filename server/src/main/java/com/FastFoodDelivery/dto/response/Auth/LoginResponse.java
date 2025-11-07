package com.FastFoodDelivery.dto.response.Auth;

import com.FastFoodDelivery.dto.response.User.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private UserResponse user;
    private String token; // Optional: for JWT token
}
