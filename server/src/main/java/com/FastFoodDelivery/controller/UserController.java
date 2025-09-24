package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.User.CreateUserRequest;
import com.FastFoodDelivery.dto.request.User.UpdateUserRequest;
import com.FastFoodDelivery.dto.response.User.UserResponse;
import com.FastFoodDelivery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getAllUser(pageable));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getByUserId(@PathVariable String userId){
        return ResponseEntity.ok(userService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest request){
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(@RequestBody @Valid UpdateUserRequest request,
                                                   @PathVariable String userId){
        return ResponseEntity.ok(userService.updateUser(request, userId));
    }

    @GetMapping("/filter-role/{roleId}")
    public ResponseEntity<Page<UserResponse>> filterByUserRole(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable String roleId){
        Pageable pageable = PageRequest.of(page, size);
        ObjectId objectId = new ObjectId(roleId);
        return ResponseEntity.ok(userService.filterByUserRole(pageable, objectId));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<String> changeStatus(@PathVariable String userId){
        userService.changeStatus(userId);
        return ResponseEntity.ok("Thay đổi trạng thái thành công");
    }
}
