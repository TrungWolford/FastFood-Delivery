package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import org.bson.types.ObjectId;

import java.util.List;

public interface CartService {
    CartResponse getCartById(ObjectId cartId);
    List<CartResponse> getCartsByUserId(Object userId);
    List<CartItemResponse> getCartItemsByCartId(ObjectId cartId);

    CartResponse createCart(CreateCartRequest request);
    CartResponse updateCart(UpdateCartRequest request, Object cartId);
    void deleteCart(ObjectId cartId);
}
