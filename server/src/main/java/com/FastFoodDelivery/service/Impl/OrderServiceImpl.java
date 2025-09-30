package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Order.CreateOrderRequest;
import com.FastFoodDelivery.dto.request.Order.UpdateOrderRequest;
import com.FastFoodDelivery.dto.response.Order.OrderResponse;
import com.FastFoodDelivery.dto.response.OrderItem.OrderItemResponse;
import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.OrderItem;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.service.OrderService;
import com.FastFoodDelivery.util.ValidationUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ValidationUtil validationUtil;

    @Override
    public OrderResponse getOrderById(ObjectId orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        return OrderResponse.fromEntity(order);
    }

    @Override
    public Page<OrderResponse> getOrdersByCustomerId(ObjectId customerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomerId(customerId, pageable);

        return orders.map(OrderResponse::fromEntity);
    }

    @Override
    public Page<OrderResponse> getOrdersByRestaurantId(ObjectId restaurantId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);

        return orders.map(OrderResponse::fromEntity);
    }

    @Override
    public List<OrderItemResponse> getOrderItemsByOrderId(ObjectId orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        return order.getOrderItems().stream()
                .map(OrderItemResponse::fromEntity)
                .toList();
    }


    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Validate user
        validationUtil.validateUser(request.getCustomerId());

        // Validate restaurant
        validationUtil.validateRestaurant(request.getRestaurantId());

        // Validate item list
        List<OrderItem> orderItems = request.getOrderItems().stream().map(itemReq -> {
            validationUtil.validateMenuItem(itemReq.getItemId());

            if (itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }

            MenuItem menuItem = menuItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm được Menu item: " + itemReq.getItemId()));

            long price = menuItem.getPrice();
            long subTotal = price * itemReq.getQuantity();

            OrderItem item = new OrderItem();
            item.setOrderItemId(new ObjectId());
            item.setItemId(itemReq.getItemId());
            item.setQuantity(itemReq.getQuantity());
            item.setNote(itemReq.getNote());
            item.setPrice(price);
            item.setSubTotal(subTotal);

            return item;
        }).toList();

        // Sau khi có orderItems thì mới tính tổng
        long totalPrice = orderItems.stream()
                .mapToLong(OrderItem::getSubTotal)
                .sum();

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setRestaurantId(request.getRestaurantId());
        order.setTotalPrice(totalPrice);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setStatus("PENDING");
        order.setOrderItems(orderItems);
        order.setCreatedAt(new Date());
        order.setUpdatedAt(new Date());

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.fromEntity(savedOrder);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        return switch (currentStatus) {
            case "PENDING" -> newStatus.equals("CONFIRMED") || newStatus.equals("CANCELLED");
            case "CONFIRMED" -> newStatus.equals("DELIVERING") || newStatus.equals("CANCELLED");
            case "DELIVERING" -> newStatus.equals("COMPLETED");
            case "COMPLETED", "CANCELLED" -> false; // không được đổi nữa
            default -> false;
        };
    }

    @Override
    public OrderResponse updateOrder(UpdateOrderRequest request, ObjectId orderId) {
        Order existingOrder = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        // Nếu có thay đổi địa chỉ giao hàng
        if (request.getDeliveryAddress() != null) {
            if ("DELIVERING".equals(existingOrder.getStatus())
                    || "COMPLETED".equals(existingOrder.getStatus())) {
                throw new IllegalStateException("Không thể đổi địa chỉ khi đơn đã giao hoặc hoàn tất");
            }
            existingOrder.setDeliveryAddress(request.getDeliveryAddress());
        }

        // Nếu có thay đổi status
        if (request.getStatus() != null) {
            if (!isValidStatusTransition(existingOrder.getStatus(), request.getStatus())) {
                throw new IllegalArgumentException(
                        "Không thể chuyển trạng thái từ " + existingOrder.getStatus() + " sang " + request.getStatus()
                );
            }
            existingOrder.setStatus(request.getStatus());
        }

        existingOrder.setUpdatedAt(new Date());
        Order updatedOrder = orderRepository.save(existingOrder);

        return OrderResponse.fromEntity(updatedOrder);
    }


    @Override
    public OrderResponse cancelOrder(ObjectId orderId) {
        Order existingOrder = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        existingOrder.setStatus("CANCELLED");
        existingOrder.setUpdatedAt(new Date());

        orderRepository.save(existingOrder);

        return OrderResponse.fromEntity(existingOrder);
    }
}
