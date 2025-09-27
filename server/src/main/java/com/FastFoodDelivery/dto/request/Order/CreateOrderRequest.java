package com.FastFoodDelivery.dto.request.Order;

import com.FastFoodDelivery.entity.OrderItem;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;

import java.util.List;

public class CreateOrderRequest {
    private ObjectId customerId;
    private ObjectId restaurantId;

    private String deliveryAddress;
    private String status;
    private List<OrderItem> orderItems;
}
