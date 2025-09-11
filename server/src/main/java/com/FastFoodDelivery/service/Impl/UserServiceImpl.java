package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.repository.UserRepository;
import com.FastFoodDelivery.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Page<UserResponse> getAllUser(Pageable pageable) {
        return userRepository.findAllUser(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    public UserResponse getByUserId(String userId) {
        return null;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        return null;
    }

    @Override
    public UserResponse updateUser(UpdateUserRequest request, String userId) {
        return null;
    }

    @Override
    public Page<UserResponse> filterByUserRole(String roleId) {
        return null;
    }

    @Override
    public void changeStatus() {

    }
}
