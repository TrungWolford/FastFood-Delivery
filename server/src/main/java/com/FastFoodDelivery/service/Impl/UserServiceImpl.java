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
        user.setRoleId(request.getRole());
        user.setCreatedAt(request.getCreatedAt());
        user.setStatus(1);

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
        existingUser.setRoleId(request.getRole());
        existingUser.setStatus(request.getStatus());

        userRepository.save(existingUser);

        return UserResponse.fromEntity(existingUser);
    }

    @Override
    public Page<UserResponse> filterByUserRole(Pageable pageable, String roleId) {
        return userRepository.findByRoleId(pageable, roleId)
                .map(UserResponse::fromEntity);
    }

    @Override
    public void changeStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        int status = user.getStatus();
        if (status == 1){
            user.setStatus(0);
        } else if (status == 0) {
            user.setStatus(1);
        }

        userRepository.save(user);
    }
}
