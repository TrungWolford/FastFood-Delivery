package com.FastFoodDelivery.dto.response.Restaurant;

import com.FastFoodDelivery.entity.Restaurant;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class RestaurantResponse {
    private String restaurantId;
    private String ownerId;
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private double rating;
    private int status;
    private String description;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date updatedAt;

    public static RestaurantResponse fromEntity(Restaurant restaurant){
        RestaurantResponse response = new RestaurantResponse();
        response.setRestaurantId(restaurant.getRestaurantId().toString());
        response.setOwnerId(restaurant.getOwnerId() != null ? restaurant.getOwnerId().toString() : null);
        response.setRestaurantName(restaurant.getRestaurantName());
        response.setAddress(restaurant.getAddress());
        response.setPhone(restaurant.getPhone());
        response.setOpeningHours(restaurant.getOpeningHours());
        response.setRating(restaurant.getRating());
        response.setStatus(restaurant.getStatus());
        response.setDescription(restaurant.getDescription());
        response.setCreatedAt(restaurant.getCreatedAt());
        response.setUpdatedAt(restaurant.getUpdatedAt());

        return response;
    }
}
