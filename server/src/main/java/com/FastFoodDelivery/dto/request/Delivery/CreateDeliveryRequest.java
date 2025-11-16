package com.FastFoodDelivery.dto.request.Delivery;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.util.Date;

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
