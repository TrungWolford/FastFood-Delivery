package com.FastFoodDelivery.dto.request.Delivery;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class CreateDeliveryRequest {
    private ObjectId droneId;
    private ObjectId orderId;
    private LocationPoint startLocation;
    private LocationPoint endLocation;
    private int status;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationPoint {
        private double latitude;
        private double longitude;
    }
}
