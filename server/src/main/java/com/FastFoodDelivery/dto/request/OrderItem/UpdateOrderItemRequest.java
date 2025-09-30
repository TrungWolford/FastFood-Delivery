package com.FastFoodDelivery.dto.request.OrderItem;

import lombok.Data;

@Data
public class UpdateOrderItemRequest {
    private Integer quantity;
    private String note;
}
