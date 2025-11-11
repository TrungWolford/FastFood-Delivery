package com.FastFoodDelivery.dto.response.RestaurantDetail;

import java.util.Date;
import java.util.List;

import com.FastFoodDelivery.entity.RestaurantDetail;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDetailResponse {
    private String restaurantDetailId;
    private String restaurantId;
    private String openingHours;
    private List<String> restaurantTypes;
    private List<String> cuisines;
    private List<String> specialties;
    private String description;
    private String coverImage;
    private List<String> menuImages;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date updatedAt;

    public static RestaurantDetailResponse fromEntity(RestaurantDetail entity) {
        RestaurantDetailResponse response = new RestaurantDetailResponse();
        response.setRestaurantDetailId(entity.getRestaurantDetailId().toString());
        response.setRestaurantId(entity.getRestaurantId().toString());
        response.setOpeningHours(entity.getOpeningHours());
        response.setRestaurantTypes(entity.getRestaurantTypes());
        response.setCuisines(entity.getCuisines());
        response.setSpecialties(entity.getSpecialties());
        response.setDescription(entity.getDescription());
        response.setCoverImage(entity.getCoverImage());
        response.setMenuImages(entity.getMenuImages());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        return response;
    }
}
