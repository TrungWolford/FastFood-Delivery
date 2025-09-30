package com.FastFoodDelivery.dto.request.Restaurant;

import lombok.Data;

@Data
public class UpdateRestaurantRequest {
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private String description;
}
