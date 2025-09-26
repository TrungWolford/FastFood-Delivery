package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CartService {
    CartResponse getCartById(ObjectId cartId);
    Page<CartResponse> getCartsByUserId(ObjectId userId, Pageable pageable);
    List<CartItemResponse> getCartItemsByCartId(ObjectId cartId);

    CartResponse createCart(CreateCartRequest request);
    CartResponse updateCart(UpdateCartRequest request, ObjectId cartId);
    void deleteCart(ObjectId cartId);
}
