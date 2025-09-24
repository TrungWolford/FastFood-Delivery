package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId;

@Repository
public interface RoleRepository extends MongoRepository<Role, ObjectId> {
}
