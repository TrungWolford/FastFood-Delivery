package com.FastFoodDelivery.dto.request.Auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Phone number is required")
    private String accountPhone;
    
    @NotBlank(message = "Password is required")
    private String password;
}
