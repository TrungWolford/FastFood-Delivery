package com.FastFoodDelivery.entity;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Document(collection = "user")
@Data
public class User {
    @Id
    private String userID;
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;

    private List<Role> roleId;
    private Date createdAt;
}
