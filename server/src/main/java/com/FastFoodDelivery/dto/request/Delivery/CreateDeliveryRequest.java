package com.FastFoodDelivery.dto.request.Delivery;

import java.util.Date;

import org.bson.types.ObjectId;

import com.FastFoodDelivery.entity.Delivery.LocationPoint;

import lombok.Data;

@Data
public class CreateDeliveryRequest {
    private ObjectId droneId;
    private ObjectId orderId;
    private LocationPoint startLocation; // Tọa độ nhà hàng
    private LocationPoint endLocation; // Tọa độ khách hàng
    private int status;
    private Date deliveredAt;
}
