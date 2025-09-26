package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "menuitems")
@Data
public class MenuItem {
    @Id
    private ObjectId itemId;
    private ObjectId restaurantId;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean isAvailable;
    private Date createdAt;
    private Date updatedAt;
}
