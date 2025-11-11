package com.FastFoodDelivery.dto.request.RestaurantDetail;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRestaurantDetailRequest {
    private String openingHours;
    private List<String> restaurantTypes;
    private List<String> cuisines;
    private List<String> specialties;
    private String description;
    private String coverImage;
    private List<String> menuImages;
}
