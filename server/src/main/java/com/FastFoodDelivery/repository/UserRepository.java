package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {
    Page<User> findAll(Pageable pageable);

    Page<User> findByRoleId(Pageable pageable, ObjectId roleId);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    // Find user by phone for login
    Optional<User> findByPhone(String phone);
}
