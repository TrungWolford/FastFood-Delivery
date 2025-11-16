package com.FastFoodDelivery.dto.response.Order;

import java.util.Date;
import java.util.List;

import com.FastFoodDelivery.dto.response.OrderItem.OrderItemResponse;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class OrderResponse {
    private String orderId;
    private String customerId;
    private String restaurantId;

    // Thông tin người nhận
    private String receiverName;
    private String receiverEmail;
    private String receiverPhone;
    private String deliveryAddress;
    private String ward; // Phường/Xã (sau sáp nhập hành chính 2025)
    private String city; // Thành phố (sau sáp nhập hành chính 2025)
    
    // Tọa độ khách hàng
    private Double customerLatitude;
    private Double customerLongitude;

    // Thông tin đơn hàng
    private String orderNote;
    private long shippingFee;
    private long totalPrice; // Tổng tiền hàng
    private long finalAmount; // Tổng tiền cuối cùng (totalPrice + shippingFee)

    private String status;
    private List<OrderItemResponse> orderItems;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date updatedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Ho_Chi_Minh")
    private Date paymentExpiresAt; // Thời gian hết hạn thanh toán

    public static OrderResponse fromEntity(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId().toString());
        response.setCustomerId(order.getCustomerId().toString());
        response.setRestaurantId(order.getRestaurantId().toString());
        
        // Thông tin người nhận
        response.setReceiverName(order.getReceiverName());
        response.setReceiverEmail(order.getReceiverEmail());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setWard(order.getWard());
        response.setCity(order.getCity()); // Sau sáp nhập hành chính 2025, không còn quận/huyện
        
        // Tọa độ khách hàng
        response.setCustomerLatitude(order.getCustomerLatitude());
        response.setCustomerLongitude(order.getCustomerLongitude());

        // Thông tin đơn hàng
        response.setOrderNote(order.getOrderNote());
        response.setShippingFee(order.getShippingFee());
        response.setTotalPrice(order.getTotalPrice());
        response.setFinalAmount(order.getFinalAmount());
        
        response.setStatus(order.getStatus());
        
        // map orderItems từ entity sang DTO
        response.setOrderItems(
                order.getOrderItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList()
        );
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setPaymentExpiresAt(order.getPaymentExpiresAt());

        return response;
    }
    
    /**
     * ✅ NEW: Convert with MenuItem name lookup
     */
    public static OrderResponse fromEntity(Order order, MenuItemRepository menuItemRepository) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId().toString());
        response.setCustomerId(order.getCustomerId().toString());
        response.setRestaurantId(order.getRestaurantId().toString());
        
        // Thông tin người nhận
        response.setReceiverName(order.getReceiverName());
        response.setReceiverEmail(order.getReceiverEmail());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setWard(order.getWard());
        response.setCity(order.getCity()); // Sau sáp nhập hành chính 2025, không còn quận/huyện
        
        // Tọa độ khách hàng
        response.setCustomerLatitude(order.getCustomerLatitude());
        response.setCustomerLongitude(order.getCustomerLongitude());
        
        // Thông tin đơn hàng
        response.setOrderNote(order.getOrderNote());
        response.setShippingFee(order.getShippingFee());
        response.setTotalPrice(order.getTotalPrice());
        response.setFinalAmount(order.getFinalAmount());
        
        response.setStatus(order.getStatus());
        
        // ✅ map orderItems với itemName
        response.setOrderItems(
                order.getOrderItems().stream()
                        .map(item -> OrderItemResponse.fromEntity(item, menuItemRepository))
                        .toList()
        );
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setPaymentExpiresAt(order.getPaymentExpiresAt());

        return response;
    }
}
