package com.FastFoodDelivery.dto.request.MenuItem;

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
}
