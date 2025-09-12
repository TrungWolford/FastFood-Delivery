package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Page<User> findAll(Pageable pageable);

    Page<User> findByRoleId(Pageable pageable, String roleId);
}
