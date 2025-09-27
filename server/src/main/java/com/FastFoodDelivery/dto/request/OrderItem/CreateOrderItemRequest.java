package com.FastFoodDelivery.dto.request.OrderItem;

import org.bson.types.ObjectId;

public class CreateOrderItemRequest {
    private ObjectId itemId;
    private Integer quantity;
    private String note;
}
