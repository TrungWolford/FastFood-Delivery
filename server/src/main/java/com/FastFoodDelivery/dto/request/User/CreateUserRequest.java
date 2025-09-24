package com.FastFoodDelivery.dto.request.User;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class CreateUserRequest {
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private ObjectId role;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;
}
