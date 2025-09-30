package com.FastFoodDelivery.dto.response.MenuItem;

import com.FastFoodDelivery.entity.MenuItem;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class MenuItemResponse {
    private String itemId;
    private String restaurantId;
    private String name;
    private String description;
    private long price;
    private String imageUrl;
    private boolean isAvailable;
    private Date createdAt;
    private Date updatedAt;

    public static MenuItemResponse fromEntity(MenuItem menuItem){
        MenuItemResponse response = new MenuItemResponse();
        response.setItemId(menuItem.getItemId().toString());
        response.setRestaurantId(menuItem.getRestaurantId().toString());
        response.setName(menuItem.getName());
        response.setDescription(menuItem.getDescription());
        response.setPrice(menuItem.getPrice());
        response.setImageUrl(menuItem.getImageUrl());
        response.setAvailable(menuItem.isAvailable());
        response.setCreatedAt(menuItem.getCreatedAt());
        response.setUpdatedAt(menuItem.getUpdatedAt());

        return response;
    }
}
