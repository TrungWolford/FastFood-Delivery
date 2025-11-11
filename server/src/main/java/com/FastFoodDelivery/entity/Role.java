package com.FastFoodDelivery.entity;

import org.springframework.data.annotation.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

@Document(collection = "roles")
@Data
public class Role {
    @Id
    private ObjectId roleID;

    private String roleName; // Customer, Admin, RestaurantOwner, Shipper
    
    private String description; // Mô tả vai trò
}
