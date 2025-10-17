package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Delivery;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends MongoRepository<Delivery, ObjectId> {
    List<Delivery> findAllByOrderId(ObjectId orderId);
}
