package com.FastFoodDelivery.dto.response.CartItem;

import com.FastFoodDelivery.entity.CartItem;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class CartItemResponse {
    private String cartItemId;
    private String itemId;
    private Integer quantity;
    private String note;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date addedAt;

    public static CartItemResponse fromEntity(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setCartItemId(cartItem.getCartItemId().toString());
        response.setItemId(cartItem.getItemId().toString());
        response.setQuantity(cartItem.getQuantity());
        response.setNote(cartItem.getNote());
        response.setAddedAt(cartItem.getAddedAt());

        return response;
    }
}
