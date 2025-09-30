package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Cart;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, ObjectId> {
    Optional<Cart> findByCartId(ObjectId cartId);
    Page<Cart> findByUserId(ObjectId userId, Pageable pageable);

    boolean findByUserIdAndRestaurantId(ObjectId userId, ObjectId restaurantId);
}
