package com.FastFoodDelivery.dto.request.CartItem;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class CreateCartItemRequest {
    private ObjectId itemId;
    private Integer quantity;
    private String note;
}
