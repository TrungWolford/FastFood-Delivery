package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Order;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, ObjectId> {
    Optional<Order> findByOrderId(ObjectId orderId);
    Page<Order> findByCustomerId(ObjectId userId, Pageable pageable);
    Page<Order> findByRestaurantId(ObjectId restaurantId, Pageable pageable);

    Optional<Order> findByCustomerIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
}
