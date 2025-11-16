package com.FastFoodDelivery.entity;

import java.util.Date;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document(collection = "restaurants")
@Data
public class Restaurant {
    @Id
    private ObjectId restaurantId;
    private ObjectId ownerId;
    private String restaurantName;
    private String address;
    private String city;
    private String ward;  // ✅ Đổi từ district sang ward (phường/xã)
    private String phone;
    private double latitude;
    private double longitude;
    private String avatarImage;
    private double rating;
    private int status;
    private Date createdAt;
    private Date updatedAt;
}
