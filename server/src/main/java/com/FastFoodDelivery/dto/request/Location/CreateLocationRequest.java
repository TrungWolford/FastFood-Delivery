package com.FastFoodDelivery.dto.request.Location;

import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class CreateLocationRequest {
    private ObjectId droneId;
    private double latitude;
    private double longitude;
    private Date recordedAt;
    private long timestamp;
}
