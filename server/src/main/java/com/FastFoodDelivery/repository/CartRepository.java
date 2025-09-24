package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Cart;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends MongoRepository<Cart, ObjectId> {
}
