package com.FastFoodDelivery.dto.request.Drone;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class CreateDroneRequest {
    @NotNull(message = "Restaurant ID is required")
    private ObjectId restaurantId;
    
    @NotNull(message = "Model is required")
    private String model;

    @Positive(message = "Capacity must be positive")
    private double capacity;
    
    @Positive(message = "Battery must be positive")
    private double battery;
}
