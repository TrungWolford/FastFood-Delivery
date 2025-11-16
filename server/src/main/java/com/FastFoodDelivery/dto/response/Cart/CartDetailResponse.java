package com.FastFoodDelivery.dto.response.Cart;

import java.util.Date;
import java.util.List;

import com.FastFoodDelivery.dto.response.CartItem.CartItemDetailResponse;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class CartDetailResponse {
    private String cartId;
    private String userId;
    private String restaurantId;
    private List<CartItemDetailResponse> items;  // Using detailed cart items with menu item info
    private Integer itemCount;
    private Double totalAmount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date updatedAt;
}
