package com.FastFoodDelivery.dto.request.MenuItem;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class CreateMenuItemRequest {
    private ObjectId restaurantId;
    private String name;
    private String description;
    private String categoryName;
    private long price;
    private String imageUrl;
    
    @JsonProperty("isAvailable")
    private boolean isAvailable = true; // Default to true
}
