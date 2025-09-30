package com.FastFoodDelivery.entity;

import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Document(collection = "orders")
@Data
public class Order {
    @Id
    private ObjectId orderId;
    private ObjectId customerId;
    private ObjectId restaurantId;

    private long totalPrice;
    private String deliveryAddress;
    private List<OrderItem> orderItems;
    private String status; // "PENDING", "CONFIRMED", "DELIVERING", "COMPLETED", "CANCELLED"
    private Date createdAt;
    private Date updatedAt;
}
