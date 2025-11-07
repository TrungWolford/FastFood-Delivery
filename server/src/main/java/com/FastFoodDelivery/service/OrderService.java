package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Order.CreateOrderRequest;
import com.FastFoodDelivery.dto.request.Order.UpdateOrderRequest;
import com.FastFoodDelivery.dto.response.Order.OrderResponse;
import com.FastFoodDelivery.dto.response.OrderItem.OrderItemResponse;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderResponse getOrderById(ObjectId orderId);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    Page<OrderResponse> getOrdersByCustomerId(ObjectId customerId, Pageable pageable);
    Page<OrderResponse> getOrdersByRestaurantId(ObjectId restaurantId, Pageable pageable);
    List<OrderItemResponse> getOrderItemsByOrderId(ObjectId orderId);

    OrderResponse createOrder(CreateOrderRequest request);
    OrderResponse updateOrder(UpdateOrderRequest request, ObjectId orderId);
    OrderResponse cancelOrder(ObjectId orderId);
}
