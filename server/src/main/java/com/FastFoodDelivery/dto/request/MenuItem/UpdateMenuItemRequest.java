package com.FastFoodDelivery.dto.request.MenuItem;

import lombok.Data;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private double price;
    private String imageUrl;
}
