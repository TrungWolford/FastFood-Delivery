package com.FastFoodDelivery.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.FastFoodDelivery.entity.Cart;

@Repository
public interface CartRepository extends MongoRepository<Cart, ObjectId> {
    Optional<Cart> findByCartId(ObjectId cartId);
    
    // Get all carts of a user (paginated)
    Page<Cart> findByUserId(ObjectId userId, Pageable pageable);
    
    // Get all carts of a user (non-paginated)
    List<Cart> findByUserId(ObjectId userId);
    
    // Get specific cart by user and restaurant
    Optional<Cart> findByUserIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
    
    // Check if cart exists for user and restaurant
    boolean existsByUserIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
}
