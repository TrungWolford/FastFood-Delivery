package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.entity.Role;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.RoleRepository;
import com.FastFoodDelivery.repository.UserRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.UserService;
import com.FastFoodDelivery.util.ValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ValidationUtil validationUtil;

    /**
     * Helper method to get restaurant ID for a user
     */
    private String getRestaurantIdForUser(ObjectId userId) {
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(userId);
        if (!restaurants.isEmpty()) {
            return restaurants.get(0).getRestaurantId().toString();
        }
        return null;
    }

    @Override
    public Page<UserResponse> getAllUser(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        List<User> users = userPage.getContent();
        
        // Lấy tất cả role IDs từ users
        List<ObjectId> roleIds = users.stream()
                .map(User::getRoleId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch tất cả roles một lần
        List<Role> roles = roleRepository.findAllById(roleIds);
        Map<ObjectId, Role> roleMap = roles.stream()
                .collect(Collectors.toMap(Role::getRoleID, role -> role));
        
        return userPage.map(user -> {
            Role role = roleMap.get(user.getRoleId());
            if (role == null) {
                throw new ResourceNotFoundException("Role", "id", user.getRoleId().toString());
            }
            String restaurantId = getRestaurantIdForUser(user.getUserID());
            return UserResponse.fromEntity(user, role, restaurantId);
        });
    }

    @Override
    public UserResponse getByUserId(ObjectId userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        Role role = roleRepository.findById(user.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", user.getRoleId().toString()));
        
        String restaurantId = getRestaurantIdForUser(user.getUserID());
        return UserResponse.fromEntity(user, role, restaurantId);
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        // Validate input data
        validationUtil.validateNotEmpty(request.getFullname(), "Full name");
        validationUtil.validateNotEmpty(request.getPassword(), "Password");
        validationUtil.validateEmail(request.getEmail());
        validationUtil.validatePhone(request.getPhone());
        validationUtil.validateNotEmpty(request.getAddress(), "Address");
        
        // Validate role exists before creating user
        validationUtil.validateRole(request.getRole());
        
        // Validate unique email and phone
        validationUtil.validateUniqueEmail(request.getEmail());
        validationUtil.validateUniquePhone(request.getPhone());

        User user = new User();
        user.setFullname(request.getFullname());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRoleId(request.getRole());
        user.setCreatedAt(new Date());
        user.setStatus(1);

        userRepository.save(user);

        Role role = roleRepository.findById(user.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", user.getRoleId().toString()));
        
        String restaurantId = getRestaurantIdForUser(user.getUserID());
        return UserResponse.fromEntity(user, role, restaurantId);
    }

    @Override
    public UserResponse updateUser(UpdateUserRequest request, ObjectId userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));

        // Validate input data
        validationUtil.validateNotEmpty(request.getFullname(), "Full name");
        validationUtil.validateNotEmpty(request.getPassword(), "Password");
        validationUtil.validateEmail(request.getEmail());
        validationUtil.validatePhone(request.getPhone());
        validationUtil.validateNotEmpty(request.getAddress(), "Address");
        
        // Validate role exists before updating user
        validationUtil.validateRole(request.getRole());
        
        // Validate unique email and phone (excluding current user)
        validationUtil.validateUniqueEmailForUpdate(request.getEmail(), userId);
        validationUtil.validateUniquePhoneForUpdate(request.getPhone(), userId);

        existingUser.setFullname(request.getFullname());
        existingUser.setPassword(request.getPassword());
        existingUser.setEmail(request.getEmail());
        existingUser.setPhone(request.getPhone());
        existingUser.setAddress(request.getAddress());
        existingUser.setRoleId(request.getRole());
        existingUser.setStatus(request.getStatus());

        userRepository.save(existingUser);

        Role role = roleRepository.findById(existingUser.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", existingUser.getRoleId().toString()));
        
        String restaurantId = getRestaurantIdForUser(existingUser.getUserID());
        return UserResponse.fromEntity(existingUser, role, restaurantId);
    }

    @Override
    public Page<UserResponse> filterByUserRole(Pageable pageable, ObjectId roleId) {
        Page<User> userPage = userRepository.findByRoleId(pageable, roleId);
        List<User> users = userPage.getContent();
        
        // Lấy tất cả role IDs từ users
        List<ObjectId> roleIds = users.stream()
                .map(User::getRoleId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch tất cả roles một lần
        List<Role> roles = roleRepository.findAllById(roleIds);
        Map<ObjectId, Role> roleMap = roles.stream()
                .collect(Collectors.toMap(Role::getRoleID, role -> role));
        
        return userPage.map(user -> {
            Role role = roleMap.get(user.getRoleId());
            if (role == null) {
                throw new ResourceNotFoundException("Role", "id", user.getRoleId().toString());
            }
            String restaurantId = getRestaurantIdForUser(user.getUserID());
            return UserResponse.fromEntity(user, role, restaurantId);
        });
    }

    @Override
    public void changeStatus(ObjectId userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId.toString()));
        int status = user.getStatus();
        if (status == 1){
            user.setStatus(0);
        } else if (status == 0) {
            user.setStatus(1);
        }

        userRepository.save(user);
    }
}
