package com.FastFoodDelivery.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.FastFoodDelivery.entity.Order;

public interface OrderRepository extends MongoRepository<Order, ObjectId> {
    Optional<Order> findByOrderId(ObjectId orderId);
    Page<Order> findByCustomerId(ObjectId userId, Pageable pageable);
    Page<Order> findByRestaurantId(ObjectId restaurantId, Pageable pageable);

    Optional<Order> findByCustomerIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
    
    // Find all orders with specific status and payment expired before given time
    List<Order> findByStatusAndPaymentExpiresAtBefore(String status, Date expirationTime);
}
