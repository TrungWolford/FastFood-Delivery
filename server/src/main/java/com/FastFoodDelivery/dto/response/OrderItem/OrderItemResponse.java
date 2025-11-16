package com.FastFoodDelivery.dto.response.OrderItem;

import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.OrderItem;
import com.FastFoodDelivery.repository.MenuItemRepository;

import lombok.Data;

@Data
public class OrderItemResponse {
    private String orderItemId;
    private String itemId;
    private String itemName; // ✅ NEW: Tên sản phẩm
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
    
    /**
     * ✅ NEW: Convert with MenuItem name lookup
     */
    public static OrderItemResponse fromEntity(OrderItem orderItem, MenuItemRepository menuItemRepository) {
        OrderItemResponse response = fromEntity(orderItem);
        
        // Try to get item name from MenuItem
        if (orderItem.getItemId() != null && menuItemRepository != null) {
            try {
                MenuItem menuItem = menuItemRepository.findById(orderItem.getItemId()).orElse(null);
                if (menuItem != null) {
                    response.setItemName(menuItem.getName());
                }
            } catch (Exception e) {
                // If lookup fails, itemName will be null
            }
        }
        
        return response;
    }
}
