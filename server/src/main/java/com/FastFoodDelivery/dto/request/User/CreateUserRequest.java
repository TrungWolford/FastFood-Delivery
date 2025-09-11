package com.FastFoodDelivery.dto.request.User;

import com.FastFoodDelivery.entity.Role;
import lombok.Data;

import java.util.List;

@Data
public class CreateUserRequest {
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private List<Role> roleId;
}
