package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    public Page<UserResponse> getAllUser(Pageable pageable);

    public UserResponse getByUserId(String userId);

    public UserResponse createUser(CreateUserRequest request);

    public UserResponse updateUser(UpdateUserRequest request, String userId);

    public Page<UserResponse> filterByUserRole(Pageable pageable, String roleId);

    // This method delete user
    public void changeStatus(String userId);

}
