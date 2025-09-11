package com.FastFoodDelivery.dto.request.User;

import com.FastFoodDelivery.entity.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class CreateUserRequest {
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private List<Role> role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;
}
