package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

        return OrderResponse.fromEntity(order, menuItemRepository);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(order -> OrderResponse.fromEntity(order, menuItemRepository));
    }

    @Override
    public Page<OrderResponse> getOrdersByCustomerId(ObjectId customerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomerId(customerId, pageable);

        return orders.map(order -> OrderResponse.fromEntity(order, menuItemRepository));
    }

    @Override
    public Page<OrderResponse> getOrdersByRestaurantId(ObjectId restaurantId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);

        return orders.map(order -> OrderResponse.fromEntity(order, menuItemRepository));
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
        // Convert String IDs to ObjectId for validation
        ObjectId customerObjectId = new ObjectId(request.getCustomerId());
        ObjectId restaurantObjectId = new ObjectId(request.getRestaurantId());
        
        // Validate user
        validationUtil.validateUser(customerObjectId);

        // Validate restaurant
        validationUtil.validateRestaurant(restaurantObjectId);

        // Validate required fields
        if (request.getReceiverName() == null || request.getReceiverName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên người nhận không được để trống");
        }
        if (request.getReceiverPhone() == null || request.getReceiverPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại người nhận không được để trống");
        }
        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Địa chỉ giao hàng không được để trống");
        }
        if (request.getWard() == null || request.getWard().trim().isEmpty()) {
            throw new IllegalArgumentException("Phường không được để trống");
        }
        if (request.getCity() == null || request.getCity().trim().isEmpty()) {
            throw new IllegalArgumentException("Thành phố không được để trống");
        }

        // Validate item list
        List<OrderItem> orderItems = request.getOrderItems().stream().map(itemReq -> {
            ObjectId itemObjectId = new ObjectId(itemReq.getItemId()); // Convert String to ObjectId
            validationUtil.validateMenuItem(itemObjectId);

            if (itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }

            MenuItem menuItem = menuItemRepository.findById(itemObjectId)
                    .orElseThrow(() -> new RuntimeException("Không tìm được Menu item: " + itemReq.getItemId()));

            long price = menuItem.getPrice();
            long subTotal = price * itemReq.getQuantity();

            OrderItem item = new OrderItem();
            item.setOrderItemId(new ObjectId());
            item.setItemId(itemObjectId); // Use converted ObjectId
            item.setName(menuItem.getName());           // ✨ Thêm tên món
            item.setImageUrl(menuItem.getImageUrl());   // ✨ Thêm URL hình ảnh
            item.setQuantity(itemReq.getQuantity());
            item.setNote(itemReq.getNote());
            item.setPrice(price);
            item.setSubTotal(subTotal);

            return item;
        }).toList();

        // Tính tổng tiền hàng
        long totalPrice = orderItems.stream()
                .mapToLong(OrderItem::getSubTotal)
                .sum();

        // Lấy phí vận chuyển (mặc định 30000 nếu không có)
        long shippingFee = request.getShippingFee() != null ? request.getShippingFee() : 30000L;

        // Tính tổng tiền cuối cùng
        long finalAmount = totalPrice + shippingFee;

        Order order = new Order();
        order.setCustomerId(customerObjectId); // Use already converted ObjectId
        order.setRestaurantId(restaurantObjectId); // Use already converted ObjectId
        
        // Thông tin người nhận
        order.setReceiverName(request.getReceiverName());
        order.setReceiverEmail(request.getReceiverEmail());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setWard(request.getWard());
        order.setCity(request.getCity());
        
        // Tọa độ khách hàng (từ OpenStreetMap Autocomplete)
        order.setCustomerLatitude(request.getCustomerLatitude());
        order.setCustomerLongitude(request.getCustomerLongitude());
        
        // Thông tin đơn hàng
        order.setOrderNote(request.getOrderNote());
        order.setShippingFee(shippingFee);
        order.setTotalPrice(totalPrice);
        order.setFinalAmount(finalAmount);
        
        order.setStatus("PENDING");
        order.setOrderItems(orderItems);
        
        Date now = new Date();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        
        // Set payment expiration time: 15 minutes from now
        Date paymentExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes in milliseconds
        order.setPaymentExpiresAt(paymentExpiresAt);

        Order savedOrder = orderRepository.save(order);

        return OrderResponse.fromEntity(savedOrder, menuItemRepository);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        return switch (currentStatus) {
            case "PENDING" -> newStatus.equals("CONFIRMED") || newStatus.equals("CANCELLED");
            case "CONFIRMED" -> newStatus.equals("PREPARING") || newStatus.equals("CANCELLED");
            case "PREPARING" -> newStatus.equals("SHIPPING") || newStatus.equals("CANCELLED");
            case "SHIPPING" -> newStatus.equals("DELIVERED");
            case "DELIVERED", "CANCELLED" -> false; // không được đổi nữa
            default -> false;
        };
    }

    @Override
    public OrderResponse updateOrder(UpdateOrderRequest request, ObjectId orderId) {
        Order existingOrder = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        // Kiểm tra trạng thái đơn hàng trước khi cho phép cập nhật thông tin
        boolean canUpdateInfo = !"SHIPPING".equals(existingOrder.getStatus())
                && !"DELIVERED".equals(existingOrder.getStatus())
                && !"CANCELLED".equals(existingOrder.getStatus());

        // Cập nhật thông tin người nhận và địa chỉ (chỉ khi đơn chưa giao)
        if (canUpdateInfo) {
            if (request.getReceiverName() != null) {
                existingOrder.setReceiverName(request.getReceiverName());
            }
            if (request.getReceiverEmail() != null) {
                existingOrder.setReceiverEmail(request.getReceiverEmail());
            }
            if (request.getReceiverPhone() != null) {
                existingOrder.setReceiverPhone(request.getReceiverPhone());
            }
            if (request.getDeliveryAddress() != null) {
                existingOrder.setDeliveryAddress(request.getDeliveryAddress());
            }
            if (request.getWard() != null) {
                existingOrder.setWard(request.getWard());
            }
            if (request.getCity() != null) {
                existingOrder.setCity(request.getCity());
            }
            if (request.getCustomerLatitude() != null) {
                existingOrder.setCustomerLatitude(request.getCustomerLatitude());
            }
            if (request.getCustomerLongitude() != null) {
                existingOrder.setCustomerLongitude(request.getCustomerLongitude());
            }
        } else {
            // Nếu đơn đang giao hoặc đã hoàn tất, chỉ báo lỗi nếu có cố gắng thay đổi
            if (request.getDeliveryAddress() != null || request.getReceiverName() != null
                    || request.getReceiverPhone() != null || request.getReceiverEmail() != null
                    || request.getWard() != null
                    || request.getCity() != null
                    || request.getCustomerLatitude() != null
                    || request.getCustomerLongitude() != null) {
                throw new IllegalStateException("Không thể thay đổi thông tin giao hàng khi đơn đã giao hoặc hoàn tất");
            }
        }

        // Cập nhật thông tin đơn hàng
        if (request.getOrderNote() != null) {
            existingOrder.setOrderNote(request.getOrderNote());
        }
        
        if (request.getShippingFee() != null) {
            existingOrder.setShippingFee(request.getShippingFee());
            // Tính lại finalAmount
            long finalAmount = existingOrder.getTotalPrice() + request.getShippingFee();
            existingOrder.setFinalAmount(finalAmount);
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

        return OrderResponse.fromEntity(updatedOrder, menuItemRepository);
    }


    @Override
    public OrderResponse cancelOrder(ObjectId orderId) {
        Order existingOrder = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        existingOrder.setStatus("CANCELLED");
        existingOrder.setUpdatedAt(new Date());

        orderRepository.save(existingOrder);

        return OrderResponse.fromEntity(existingOrder, menuItemRepository);
    }
}
