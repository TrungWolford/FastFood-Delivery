package com.FastFoodDelivery.entity;

import org.springframework.data.annotation.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

import java.util.Date;

@Document(collection = "users")
@Data
public class User {
    @Id
    private ObjectId userID;
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private ObjectId roleId;
    private Date createdAt;
    private int status; // 0: Khoa, 1: Dang hoat dong
    
    // Explicit getters and setters for status and createdAt
    public int getStatus() {
        return status;
    }
    
    public void setStatus(int status) {
        this.status = status;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
