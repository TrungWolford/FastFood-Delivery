package com.FastFoodDelivery.dto.response.MenuItem;

import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.Restaurant;
import lombok.Data;

import java.util.Date;

@Data
public class MenuItemResponse {
    private String itemId;
    private String restaurantId;
    private String restaurantAddress;
    private String name;
    private String description;
    private String categoryName;
    private long price;
    private String imageUrl;
    private boolean isAvailable;
    private Date createdAt;
    private Date updatedAt;

    public static MenuItemResponse fromEntity(MenuItem menuItem, Restaurant restaurant){
        MenuItemResponse response = new MenuItemResponse();
        response.setItemId(menuItem.getItemId().toString());
        response.setRestaurantId(menuItem.getRestaurantId().toString());
        response.setRestaurantAddress(restaurant != null ? restaurant.getAddress() : "");
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setCategoryName(menuItem.getCategoryName());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setAvailable(menuItem.isAvailable());
        response.setCreatedAt(menuItem.getCreatedAt());
        response.setUpdatedAt(menuItem.getUpdatedAt());

        return response;
    }
}
