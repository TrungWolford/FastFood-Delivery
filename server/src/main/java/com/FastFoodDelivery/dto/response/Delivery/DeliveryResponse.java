package com.FastFoodDelivery.dto.response.Delivery;

import com.FastFoodDelivery.entity.Delivery;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class DeliveryResponse {
    private String deliveryId;
    private String droneId;
    private String orderId;
    private LocationPoint startLocation;
    private LocationPoint endLocation;
    private int status;
    private Date deliveredAt;
    private String statusText;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationPoint {
        private double latitude;
        private double longitude;
    }

    public static DeliveryResponse fromEntity(Delivery delivery){
        if (delivery == null) {
            throw new IllegalArgumentException("Delivery entity cannot be null");
        }
        
        DeliveryResponse response = new DeliveryResponse();
        
        // Safely convert ObjectIds to Strings with null checks
        response.setDeliveryId(delivery.getDeliveryId() != null ? delivery.getDeliveryId().toString() : null);
        response.setDroneId(delivery.getDroneId() != null ? delivery.getDroneId().toString() : null);
        response.setOrderId(delivery.getOrderId() != null ? delivery.getOrderId().toString() : null);
        
        // Convert LocationPoint from entity to response
        if (delivery.getStartLocation() != null) {
            response.setStartLocation(new LocationPoint(
                delivery.getStartLocation().getLatitude(),
                delivery.getStartLocation().getLongitude()
            ));
        }
        if (delivery.getEndLocation() != null) {
            response.setEndLocation(new LocationPoint(
                delivery.getEndLocation().getLatitude(),
                delivery.getEndLocation().getLongitude()
            ));
        }
        
        response.setStatus(delivery.getStatus());
        response.setDeliveredAt(delivery.getDeliveredAt());
        int s = response.getStatus();
        switch (s){
            case 0:
                response.setStatusText("Pending");
                break;
            case 1:
                response.setStatusText("Delivering");
                break;
            case 2:
                response.setStatusText("Delivered");
                break;
            case -1:
                response.setStatusText("Cancelled");
                break;
        }

        return response;
    }
}
