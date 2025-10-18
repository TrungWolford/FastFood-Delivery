package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Location;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Location, ObjectId> {
    /**
     * Tìm location mới nhất của drone theo timestamp
     */
    Optional<Location> findTopByDroneIdOrderByTimestampDesc(ObjectId droneId);
}
