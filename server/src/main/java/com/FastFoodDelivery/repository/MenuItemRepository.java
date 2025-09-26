package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.MenuItem;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, ObjectId> {
    Page<MenuItem> findAll(Pageable pageable);

    List<MenuItem> findByRestaurantId(ObjectId restaurantId);
}
