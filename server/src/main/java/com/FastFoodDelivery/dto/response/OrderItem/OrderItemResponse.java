package com.FastFoodDelivery.dto.response.OrderItem;

import com.FastFoodDelivery.entity.OrderItem;
import com.FastFoodDelivery.repository.MenuItemRepository;

import lombok.Data;

@Data
public class OrderItemResponse {
    private String orderItemId;
    private String itemId;
    private String name;        // Tên món ăn
    private String imageUrl;    // URL hình ảnh món ăn
    private Integer quantity;
    private String note;
    private long price;
    private long subTotal;

    public static OrderItemResponse fromEntity(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(orderItem.getOrderItemId().toString());
        response.setItemId(orderItem.getItemId().toString());
        response.setName(orderItem.getName());
        response.setImageUrl(orderItem.getImageUrl());
        response.setQuantity(orderItem.getQuantity());
        response.setNote(orderItem.getNote());
        response.setPrice(orderItem.getPrice());
        response.setSubTotal(orderItem.getSubTotal());

        return response;
    }
    
    /**
     * ✅ Convert with MenuItem name lookup (optional)
     * Note: OrderItem already has name field, so this method is same as fromEntity(orderItem)
     */
    public static OrderItemResponse fromEntity(OrderItem orderItem, MenuItemRepository menuItemRepository) {
        // OrderItem already stores name and imageUrl, just use fromEntity
        return fromEntity(orderItem);
    }
}
