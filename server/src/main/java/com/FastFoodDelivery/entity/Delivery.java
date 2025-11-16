package com.FastFoodDelivery.entity;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
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
    
    // Change: startLocation and endLocation should be Object containing lat/lng, not double
    private LocationPoint startLocation; // Starting location (restaurant)
    private LocationPoint endLocation;   // Ending location (customer)
    
    private int status; // 0: Pending, 1: Delivering, 2: Delivered , -1: Cancelled
    private Date deliveredAt;

    // Inner class to store coordinates
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationPoint {
        private double latitude;
        private double longitude;
    }
}
