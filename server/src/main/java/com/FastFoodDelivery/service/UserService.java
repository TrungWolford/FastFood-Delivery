package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.bson.types.ObjectId;

public interface UserService {
    Page<UserResponse> getAllUser(Pageable pageable);
    UserResponse getByUserId(ObjectId userId);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(UpdateUserRequest request, ObjectId userId);
    Page<UserResponse> filterByUserRole(Pageable pageable, ObjectId roleId);
    void changeStatus(ObjectId userId);
}
