package com.FastFoodDelivery.dto.response.Cart;

import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import com.FastFoodDelivery.entity.Cart;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class CartResponse {
    private String cartId;
    private String userId;
    private String restaurantId;
    private List<CartItemResponse> cartItems;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date updatedAt;

    public static CartResponse fromEntity(Cart cart) {
        CartResponse response = new CartResponse();
        response.setCartId(cart.getCartId().toString());
        response.setUserId(cart.getUserId().toString());
        response.setRestaurantId(cart.getRestaurantId().toString());
        // map cartItems từ entity sang DTO
        response.setCartItems(
                cart.getCartItems().stream()
                        .map(CartItemResponse::fromEntity)
                        .toList()
        );
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());

        return response;
    }
}