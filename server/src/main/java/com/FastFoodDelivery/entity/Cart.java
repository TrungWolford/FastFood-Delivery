package com.FastFoodDelivery.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Document(collection = "carts")
@Data
public class Cart {
    @Id
    private ObjectId cartId;
    private ObjectId userId;
    private ObjectId restaurantId;
    private List<CartItem> cartItems;
    private Date createdAt;
    private Date updatedAt;
}
