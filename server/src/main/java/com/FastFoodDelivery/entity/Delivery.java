package com.FastFoodDelivery.entity;

import java.util.Date;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "deliveries")
@Data
public class Delivery {
    @Id
    private ObjectId deliveryId;
    private ObjectId droneId;
    private ObjectId orderId;

    private LocationPoint startLocation; // Starting location (restaurant)
    private LocationPoint endLocation; // Ending location (customer)

    private int status; // 0: Pending, 1: Delivering, 2: Delivered , -1: Cancelled
    private Date deliveredAt;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationPoint {
        private double latitude;
        private double longitude;    
    }
}
