package com.FastFoodDelivery.dto.request.Restaurant;

import lombok.Data;

@Data
public class UpdateRestaurantRequest {
    private String restaurantName;
    private String address;
    private String city;
    private String district;
    private String phone;
    private double latitude;
    private double longitude;
    private String avatarImage;
}
