package com.FastFoodDelivery.dto.request.Cart;

import com.FastFoodDelivery.entity.CartItem;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.List;

@Data
public class CreateCartRequest {
    private ObjectId userId;
    private ObjectId restaurantId;
    private List<CartItemRequest> cartItems;
}
