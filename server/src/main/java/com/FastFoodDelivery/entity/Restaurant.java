package com.FastFoodDelivery.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

import java.util.Date;

@Document(collection = "restaurants")
@Data
public class Restaurant {
    @Id
    private String restaurantId;
    private ObjectId ownerId;
    private String restaurantName;
    private String address;
    private String phone;
    private String openingHours;
    private double rating;
    private Date createdAt;
    private int status;
    private Date updatedAt;
    private String description;
}
