package com.FastFoodDelivery.dto.request.Order;

import com.FastFoodDelivery.dto.request.OrderItem.CreateOrderItemRequest;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.List;

@Data
public class CreateOrderRequest {
    private ObjectId customerId;
    private ObjectId restaurantId;

    private String deliveryAddress;
    private List<CreateOrderItemRequest> orderItems;
}
