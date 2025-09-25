package com.FastFoodDelivery.dto.request.CartItem;

import lombok.Data;

@Data
public class UpdateCartItemRequest {
    private Integer quantity;
    private String note;
}
