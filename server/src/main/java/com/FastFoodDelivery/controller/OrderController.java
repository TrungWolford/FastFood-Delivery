package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Order.CreateOrderRequest;
import com.FastFoodDelivery.dto.request.Order.UpdateOrderRequest;
import com.FastFoodDelivery.dto.response.Order.OrderResponse;
import com.FastFoodDelivery.dto.response.OrderItem.OrderItemResponse;
import com.FastFoodDelivery.service.OrderService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Lấy order theo id
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(new ObjectId(orderId)));
    }

    // Lấy order theo customerId (phân trang)
    @GetMapping("/user/{customerId}")
    public ResponseEntity<Page<OrderResponse>> getOrdersByCustomerId(
            @PathVariable String customerId,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(new ObjectId(customerId), pageable));
    }

    // Lấy order theo restaurantId (phân trang)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<OrderResponse>> getOrdersByRestaurantId(
            @PathVariable String restaurantId,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurantId(new ObjectId(restaurantId), pageable));
    }

    // Lấy danh sách order items theo orderId
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItemResponse>> getOrderItemsByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderItemsByOrderId(new ObjectId(orderId)));
    }

    // Tạo order mới
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    // Update order (chỉ cập nhật deliveryAddress, status)
    @PatchMapping("/{orderId}")
    public ResponseEntity<OrderResponse> updateOrder(@RequestBody UpdateOrderRequest request,
                                                   @PathVariable String orderId) {
        return ResponseEntity.ok(orderService.updateOrder(request, new ObjectId(orderId)));
    }

    // Cancel order
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(new ObjectId(orderId));
        return ResponseEntity.noContent().build();
    }
}
