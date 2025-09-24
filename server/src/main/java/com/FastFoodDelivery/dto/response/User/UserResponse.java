package com.FastFoodDelivery.dto.response.User;

import com.FastFoodDelivery.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class UserResponse {
    private String userID;
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private ObjectId roleId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;
    private int status;

    public static UserResponse fromEntity(User user){
        UserResponse response = new UserResponse();
        response.setUserID(user.getUserID());
        response.setFullname(user.getFullname());
        response.setPassword(user.getPassword());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRoleId(user.getRoleId());
        response.setCreatedAt(user.getCreatedAt());
        response.setStatus(user.getStatus());

        return response;
    }
}
