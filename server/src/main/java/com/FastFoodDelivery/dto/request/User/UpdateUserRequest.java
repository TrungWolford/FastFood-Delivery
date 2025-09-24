package com.FastFoodDelivery.dto.request.User;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class UpdateUserRequest {
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String adress;
    private ObjectId role;
    private int status;
}
