package com.FastFoodDelivery.dto.request.Restaurant;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class CreateRestaurantRequest {
    private ObjectId ownerId;
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private String description;
}
