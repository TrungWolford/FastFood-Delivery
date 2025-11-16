package com.FastFoodDelivery.dto.response.CartItem;

import java.util.Date;

import com.FastFoodDelivery.entity.CartItem;
import com.FastFoodDelivery.entity.MenuItem;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class CartItemDetailResponse {
    private String cartItemId;
    private String itemId;
    private String itemName;
    private Double price;
    private String imageUrl;
    private Integer quantity;
    private String note;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date addedAt;

    public static CartItemDetailResponse fromEntity(CartItem cartItem, MenuItem menuItem) {
        CartItemDetailResponse response = new CartItemDetailResponse();
        response.setCartItemId(cartItem.getCartItemId().toString());
        response.setItemId(cartItem.getItemId().toString());
        response.setQuantity(cartItem.getQuantity());
        response.setNote(cartItem.getNote());
        response.setAddedAt(cartItem.getAddedAt());
        
        // Add menu item details
        if (menuItem != null) {
            response.setItemName(menuItem.getName());
            response.setPrice((double) menuItem.getPrice());
            response.setImageUrl(menuItem.getImageUrl());
        }

        return response;
    }
}
