package com.FastFoodDelivery.dto.request.Delivery;

import org.bson.types.ObjectId;

import com.FastFoodDelivery.entity.Delivery.LocationPoint;

import lombok.Data;

@Data
public class UpdateDeliveryRequest {
    private ObjectId orderId;
    private LocationPoint startLocation; // Tọa độ nhà hàng
    private LocationPoint endLocation; // Tọa độ khách hàng
    private int status;
}
