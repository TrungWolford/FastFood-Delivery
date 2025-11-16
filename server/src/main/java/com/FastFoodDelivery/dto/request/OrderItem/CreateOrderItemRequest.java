package com.FastFoodDelivery.dto.request.OrderItem;

import lombok.Data;

@Data
public class CreateOrderItemRequest {
    private String itemId; // Changed from ObjectId to String
    private Integer quantity;
    private String note;
}
