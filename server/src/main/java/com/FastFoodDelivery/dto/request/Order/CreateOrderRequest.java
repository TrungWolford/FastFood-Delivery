package com.FastFoodDelivery.dto.request.Order;

import java.util.List;

import com.FastFoodDelivery.dto.request.OrderItem.CreateOrderItemRequest;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private String customerId; // Changed from ObjectId to String
    private String restaurantId; // Changed from ObjectId to String

    // Thông tin người nhận
    private String receiverName;
    private String receiverEmail;
    private String receiverPhone;
    private String deliveryAddress; // Số nhà, tên đường
    private String ward; // Phường (sau sáp nhập hành chính 2025)
    private String city; // Thành phố (sau sáp nhập hành chính 2025)

    // Thông tin đơn hàng
    private String orderNote; // Ghi chú đơn hàng
    private Long shippingFee; // Phí vận chuyển

    private List<CreateOrderItemRequest> orderItems;
}
