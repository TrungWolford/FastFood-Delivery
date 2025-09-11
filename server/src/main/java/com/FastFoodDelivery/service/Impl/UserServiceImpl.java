package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
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
        User user =  userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserResponse.fromEntity(user);
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        User user = new User();
        user.setFullname(request.getFullname());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());
        user.setCreatedAt(request.getCreatedAt());

        userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    @Override
    public UserResponse updateUser(UpdateUserRequest request, String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        existingUser.setFullname(request.getFullname());
        existingUser.setPassword(request.getPassword());
        existingUser.setEmail(request.getEmail());
        existingUser.setPhone(request.getPhone());
        existingUser.setAddress(request.getAdress());
        existingUser.setRole(request.getRole());

        userRepository.save(existingUser);

        return UserResponse.fromEntity(existingUser);
    }

    @Override
    public Page<UserResponse> filterByUserRole(String roleId) {
        return null;
    }

    @Override
    public void changeStatus() {

    }
}
