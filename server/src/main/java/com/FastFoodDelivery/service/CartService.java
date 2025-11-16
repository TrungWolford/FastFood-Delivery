package com.FastFoodDelivery.service;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.request.CartItem.CreateCartItemRequest;
import com.FastFoodDelivery.dto.request.CartItem.UpdateCartItemRequest;
import com.FastFoodDelivery.dto.response.Cart.CartDetailResponse;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;

public interface CartService {
    // Get cart operations
    CartResponse getCartById(ObjectId cartId);
    Page<CartResponse> getCartsByUserId(ObjectId userId, Pageable pageable);
    List<CartResponse> getAllCartsByUserId(ObjectId userId);
    List<CartDetailResponse> getAllCartsDetailByUserId(ObjectId userId);  // New method with menu item details
    CartResponse getCartByUserIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
    List<CartItemResponse> getCartItemsByCartId(ObjectId cartId);

    // Cart CRUD operations
    CartResponse createCart(CreateCartRequest request);
    CartResponse getOrCreateCart(ObjectId userId, ObjectId restaurantId);
    CartResponse updateCart(UpdateCartRequest request, ObjectId cartId);
    void deleteCart(ObjectId cartId);

    // Cart item operations
    CartResponse addItemToCart(ObjectId cartId, CreateCartItemRequest request);
    CartResponse addItemToRestaurantCart(ObjectId userId, ObjectId restaurantId, CreateCartItemRequest request);
    CartResponse updateItemInCart(ObjectId cartId, ObjectId itemId, UpdateCartItemRequest request);
    CartResponse removeItemFromCart(ObjectId cartId, ObjectId itemId);
    
    // Clear all carts for a user
    void clearUserCarts(ObjectId userId);
}
