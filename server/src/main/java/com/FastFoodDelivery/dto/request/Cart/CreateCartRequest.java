package com.FastFoodDelivery.dto.request.Cart;

import com.FastFoodDelivery.dto.request.CartItem.CreateCartItemRequest;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.List;

@Data
public class CreateCartRequest {
    private ObjectId userId;
    private ObjectId restaurantId;
    private List<CreateCartItemRequest> cartItems;
}