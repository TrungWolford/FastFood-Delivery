package com.FastFoodDelivery.dto.request.Order;

import lombok.Data;

@Data
public class UpdateOrderRequest {
    // Thông tin người nhận
    private String receiverName;
    private String receiverEmail;
    private String receiverPhone;
    private String deliveryAddress;
    private String ward;
    private String district;
    private String city;

    // Thông tin đơn hàng
    private String orderNote;
    private Long shippingFee;

    private String status;
}
