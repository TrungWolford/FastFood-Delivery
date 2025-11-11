package com.FastFoodDelivery.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.FastFoodDelivery.entity.AccountRestaurantDetail;

@Repository
public interface AccountRestaurantDetailRepository extends MongoRepository<AccountRestaurantDetail, ObjectId> {
    
    // Find by userId
    Optional<AccountRestaurantDetail> findByUserId(ObjectId userId);
    
    // Find by restaurantId
    Optional<AccountRestaurantDetail> findByRestaurantId(ObjectId restaurantId);
    
    // Find by verification status
    List<AccountRestaurantDetail> findByVerificationStatus(String verificationStatus);
    
    // Check if already exists for userId
    boolean existsByUserId(ObjectId userId);
    
    // Check if already exists for restaurantId
    boolean existsByRestaurantId(ObjectId restaurantId);
}
