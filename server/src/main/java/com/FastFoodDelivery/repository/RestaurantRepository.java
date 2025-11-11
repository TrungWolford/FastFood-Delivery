package com.FastFoodDelivery.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.FastFoodDelivery.entity.Restaurant;

@Repository
public interface RestaurantRepository extends MongoRepository<Restaurant, ObjectId> {
    // Find by ownerId
    List<Restaurant> findByOwnerId(ObjectId ownerId);
    
    // Find by city and district
    List<Restaurant> findByCity(String city);
    List<Restaurant> findByDistrict(String district);
    List<Restaurant> findByCityAndDistrict(String city, String district);
    
    // Find by status
    List<Restaurant> findByStatus(int status);
    
    // Check exists
    boolean existsByPhone(String phone);
    boolean existsByOwnerId(ObjectId ownerId);
}
