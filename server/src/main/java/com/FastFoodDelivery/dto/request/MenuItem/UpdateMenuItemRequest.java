package com.FastFoodDelivery.dto.request.MenuItem;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private String categoryName;
    private long price;
    private String imageUrl;
    
    @JsonProperty("isAvailable")
    private Boolean isAvailable; // Use Boolean (not boolean) to allow null
}
