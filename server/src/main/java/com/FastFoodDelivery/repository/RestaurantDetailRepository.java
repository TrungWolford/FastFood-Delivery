package com.FastFoodDelivery.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.FastFoodDelivery.entity.RestaurantDetail;

@Repository
public interface RestaurantDetailRepository extends MongoRepository<RestaurantDetail, ObjectId> {
    
    // Find by restaurantId
    Optional<RestaurantDetail> findByRestaurantId(ObjectId restaurantId);
    
    // Check if exists by restaurantId
    boolean existsByRestaurantId(ObjectId restaurantId);
}
