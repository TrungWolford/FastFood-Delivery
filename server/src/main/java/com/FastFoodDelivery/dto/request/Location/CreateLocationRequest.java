package com.FastFoodDelivery.dto.request.Location;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class CreateLocationRequest {
    @NotNull(message = "Drone ID is required")
    private ObjectId droneId;
    
    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be at least -90")
    @Max(value = 90, message = "Latitude must be at most 90")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be at least -180")
    @Max(value = 180, message = "Longitude must be at most 180")
    private Double longitude;
    
    private Date recordedAt;
    private long timestamp;
}
