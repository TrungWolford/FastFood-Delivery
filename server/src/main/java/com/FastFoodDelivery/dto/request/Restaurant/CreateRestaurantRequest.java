package com.FastFoodDelivery.dto.request.Restaurant;

import lombok.Data;

@Data
public class CreateRestaurantRequest {
    private String ownerId;  // Change from ObjectId to String, will convert in service
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private String description;
}
