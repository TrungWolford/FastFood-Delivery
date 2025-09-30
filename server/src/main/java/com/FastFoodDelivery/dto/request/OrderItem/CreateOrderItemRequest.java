package com.FastFoodDelivery.dto.request.OrderItem;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class CreateOrderItemRequest {
    private ObjectId itemId;
    private Integer quantity;
    private String note;
}
