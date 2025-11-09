package com.FastFoodDelivery.dto.request.MenuItem;

import lombok.Data;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private String categoryName;
    private long price;
    private String imageUrl;
}
