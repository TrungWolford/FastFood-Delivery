package com.FastFoodDelivery.entity;

import org.springframework.data.annotation.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles")
@Data
public class Role {
    @Id
    private String roleID;

    private String roleName; // Customer, Admin, RestaurantOwner, Shipper
}
