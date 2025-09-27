package com.FastFoodDelivery.dto.request.CartItem;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class UpdateCartItemRequest {
    private ObjectId cartItemId;
    private Integer quantity;
    private String note;
}
