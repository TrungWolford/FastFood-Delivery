package com.FastFoodDelivery.dto.request.Order;

import com.FastFoodDelivery.entity.OrderItem;
import org.bson.types.ObjectId;

import java.util.List;

public class UpdateOrderRequest {
    private ObjectId orderId;

    private String deliveryAddress;
    private String status;
    private List<OrderItem> orderItems;
}
