package com.FastFoodDelivery.dto.response.Restaurant;

import com.FastFoodDelivery.entity.Restaurant;
import lombok.Data;

@Data
public class RestaurantResponse {
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private double rating;
    private String description;

    public static RestaurantResponse fromEntity(Restaurant restaurant){
        RestaurantResponse response = new RestaurantResponse();
        response.setRestaurantName(restaurant.getRestaurantName());
        response.setAddress(response.getAddress());
        response.setPhone(response.getPhone());
        response.setOpeningHours(response.getOpeningHours());
        response.setRating(response.getRating());
        response.setDescription(response.getDescription());

        return response;
    }
}
