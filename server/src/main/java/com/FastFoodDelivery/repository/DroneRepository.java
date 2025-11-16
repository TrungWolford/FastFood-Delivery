package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Drone;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DroneRepository extends MongoRepository<Drone, ObjectId> {
    Page<Drone> findAllByRestaurantId(Pageable pageable, ObjectId restaurantId);
    // Fixed: Pageable must be last parameter for Spring Data to work correctly
    Page<Drone> findAllByRestaurantIdAndStatus(ObjectId restaurantId, String status, Pageable pageable);
}
