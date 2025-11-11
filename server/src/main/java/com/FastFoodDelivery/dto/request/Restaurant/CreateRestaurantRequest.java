package com.FastFoodDelivery.dto.request.Restaurant;

import org.bson.types.ObjectId;

import lombok.Data;

@Data
public class CreateRestaurantRequest {
    private ObjectId ownerId;
    private String restaurantName;
    private String address;
    private String city;
    private String district;
    private String phone;
    private double latitude;
    private double longitude;
    private String avatarImage;
}
