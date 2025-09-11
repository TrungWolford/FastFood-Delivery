package com.FastFoodDelivery.dto.response.User;

import com.FastFoodDelivery.entity.Role;
import com.FastFoodDelivery.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.Date;
import java.util.List;

@Data
public class UserResponse {
    private String userID;
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private List<Role> role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;

    public static UserResponse fromEntity(User user){
        UserResponse response = new UserResponse();
        response.setUserID(user.getUserID());
        response.setFullname(user.getFullname());
        response.setPassword(user.getPassword());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }
}
