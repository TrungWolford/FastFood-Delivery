package com.FastFoodDelivery.dto.request.Order;

import lombok.Data;

@Data
public class UpdateOrderRequest {
    private String deliveryAddress;
    private String status;
}
