package com.FastFoodDelivery.dto.response.Delivery;

import java.util.Date;

import com.FastFoodDelivery.entity.Delivery;
import com.FastFoodDelivery.entity.Delivery.LocationPoint;

import lombok.Data;

@Data
public class DeliveryResponse {
    private String deliveryId;
    private String droneId;
    private String orderId;
    private LocationPoint startLocation; // Tọa độ nhà hàng
    private LocationPoint endLocation; // Tọa độ khách hàng
    private int status;
    private Date deliveredAt;
    private String statusText;

    public static DeliveryResponse fromEntity(Delivery delivery){
        DeliveryResponse response = new DeliveryResponse();
        response.setDeliveryId(delivery.getDeliveryId().toString());
        
        // Handle null droneId
        if (delivery.getDroneId() != null) {
            response.setDroneId(delivery.getDroneId().toString());
        }
        
        response.setOrderId(delivery.getOrderId().toString());
        response.setStartLocation(delivery.getStartLocation());
        response.setEndLocation(delivery.getEndLocation());
        response.setStatus(delivery.getStatus());
        response.setDeliveredAt(delivery.getDeliveredAt());
        
        // Fix switch statement - add break
        int s = delivery.getStatus();
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
            default:
                response.setStatusText("Unknown");
                break;
        }

        return response;
    }
}
