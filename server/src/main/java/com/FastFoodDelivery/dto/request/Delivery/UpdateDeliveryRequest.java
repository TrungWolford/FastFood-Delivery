package com.FastFoodDelivery.dto.request.Delivery;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class UpdateDeliveryRequest {
    private ObjectId orderId;
    private double startLocation;
    private double endLocation;
    private int status;
}
