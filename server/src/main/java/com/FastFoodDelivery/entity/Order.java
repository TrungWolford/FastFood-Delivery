package com.FastFoodDelivery.entity;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document(collection = "orders")
@Data
public class Order {
    @Id
    private ObjectId orderId;
    private ObjectId customerId;
    private ObjectId restaurantId;

    // Thông tin người nhận
    private String receiverName;
    private String receiverEmail;
    private String receiverPhone;
    private String deliveryAddress; // Số nhà, tên đường
    private String ward; // Phường (sau sáp nhập hành chính 2025)
    private String city; // Thành phố (sau sáp nhập hành chính 2025)

    // Thông tin đơn hàng
    private String orderNote; // Ghi chú đơn hàng
    private long shippingFee; // Phí vận chuyển
    private long totalPrice; // Tổng tiền hàng (chưa bao gồm ship)
    private long finalAmount; // Tổng tiền cuối cùng (totalPrice + shippingFee)

    private List<OrderItem> orderItems;
    private String status; // "PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED", "CANCELLED"
    private Date createdAt;
    private Date updatedAt;
    private Date paymentExpiresAt; // Thời gian hết hạn thanh toán (15 phút từ khi tạo đơn)
}
