package com.FastFoodDelivery.dto.request.MenuItem;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class CreateMenuItemRequest {
    private ObjectId restaurantId;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
}
