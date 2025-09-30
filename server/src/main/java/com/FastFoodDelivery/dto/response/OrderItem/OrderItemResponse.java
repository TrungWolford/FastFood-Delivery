package com.FastFoodDelivery.dto.response.OrderItem;

import com.FastFoodDelivery.entity.OrderItem;
import lombok.Data;

@Data
public class OrderItemResponse {
    private String orderItemId;
    private String itemId;
    private Integer quantity;
    private String note;
    private long price;
    private long subTotal;

    public static OrderItemResponse fromEntity(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(orderItem.getOrderItemId().toString());
        response.setItemId(orderItem.getItemId().toString());
        response.setQuantity(orderItem.getQuantity());
        response.setNote(orderItem.getNote());
        response.setPrice(orderItem.getPrice());
        response.setSubTotal(orderItem.getSubTotal());

        return response;
    }
}
