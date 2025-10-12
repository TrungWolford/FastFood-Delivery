package com.FastFoodDelivery.dto.request.Drone;

import lombok.Data;

@Data
public class UpdateDroneRequest {
    private String model;
    private double capacity;
    private double battery;
    private String status;
}
