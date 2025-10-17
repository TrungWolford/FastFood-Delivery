package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "deliveries")
@Data
public class Delivery {
    @Id
    private ObjectId deliveryId;
    private ObjectId droneId;
    private ObjectId orderId;
    private double startLocation;
    private double endLocation;
    private int status; // 0: Pending, 1: Delivering, 2: Delivered , -1: Cancelled
    private Date deliveredAt;

}
