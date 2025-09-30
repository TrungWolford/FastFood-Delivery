package com.FastFoodDelivery.dto.response.Order;

import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import com.FastFoodDelivery.dto.response.OrderItem.OrderItemResponse;
import com.FastFoodDelivery.entity.Cart;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.OrderItem;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.bson.types.Decimal128;

import java.util.Date;
import java.util.List;

@Data
public class OrderResponse {
    private String orderId;
    private String customerId;
    private String restaurantId;

    private long totalPrice;
    private String deliveryAddress;
    private String status;
    private List<OrderItemResponse> orderItems;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date updatedAt;

    public static OrderResponse fromEntity(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId().toString());
        response.setCustomerId(order.getCustomerId().toString());
        response.setRestaurantId(order.getRestaurantId().toString());
        response.setTotalPrice(order.getTotalPrice());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setStatus(order.getStatus());
        // map cartItems từ entity sang DTO
        response.setOrderItems(
                order.getOrderItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList()
        );
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
