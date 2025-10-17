package com.FastFoodDelivery.dto.response.Delivery;

import com.FastFoodDelivery.entity.Delivery;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class DeliveryResponse {
    private String deliveryId;
    private String droneId;
    private String orderId;
    private double startLocation;
    private double endLocation;
    private int status;
    private Date deliveredAt;
    private String statusText;

    public static DeliveryResponse fromEntity(Delivery delivery){
        DeliveryResponse response = new DeliveryResponse();
        response.setDeliveryId(delivery.getDeliveryId().toString());
        response.setDroneId(delivery.getDroneId().toString());
        response.setOrderId(delivery.getOrderId().toString());
        response.setStartLocation(delivery.getStartLocation());
        response.setEndLocation(delivery.getEndLocation());
        response.setStatus(delivery.getStatus());
        response.setDeliveredAt(delivery.getDeliveredAt());
        int s = response.getStatus();
        switch (s){
            case 0:
                response.setStatusText("Pending");
            case 1:
                response.setStatusText("Delivering");
            case 2:
                response.setStatusText("Delivered");
            case -1:
                response.setStatusText("Cancelled");
        }

        return response;
    }
}
