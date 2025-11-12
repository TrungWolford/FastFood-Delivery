package com.FastFoodDelivery.dto.response.Restaurant;

import java.util.Date;

import com.FastFoodDelivery.entity.Restaurant;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class RestaurantResponse {
    private String restaurantId;
    private String ownerId;
    private String restaurantName;
    private String address;
    private String city;
    private String district;
    private String phone;
    private double latitude;
    private double longitude;
    private String avatarImage;
    private double rating;
    private int status;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date updatedAt;

    public static RestaurantResponse fromEntity(Restaurant restaurant){
        RestaurantResponse response = new RestaurantResponse();
        response.setRestaurantId(restaurant.getRestaurantId().toString());
        response.setOwnerId(restaurant.getOwnerId() != null ? restaurant.getOwnerId().toString() : null);
        response.setRestaurantName(restaurant.getRestaurantName());
        response.setAddress(restaurant.getAddress());
        response.setCity(restaurant.getCity());
        response.setDistrict(restaurant.getDistrict());
        response.setPhone(restaurant.getPhone());
        response.setLatitude(restaurant.getLatitude());
        response.setLongitude(restaurant.getLongitude());
        response.setAvatarImage(restaurant.getAvatarImage());
        response.setRating(restaurant.getRating());
        response.setStatus(restaurant.getStatus());
        response.setCreatedAt(restaurant.getCreatedAt());
        response.setUpdatedAt(restaurant.getUpdatedAt());

        return response;
    }
}

