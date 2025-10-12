package com.FastFoodDelivery.dto.response.Drone;

import com.FastFoodDelivery.entity.Drone;
import lombok.Data;

@Data
public class DroneResponse {
    private String droneId;
    private String restaurantId;
    private String model;
    private double capacity;
    private double battery;
    private String status;

    public static DroneResponse fromEntity(Drone drone){
        DroneResponse response = new DroneResponse();
        response.setDroneId(drone.getDroneId().toString());
        response.setRestaurantId(drone.getRestaurantId().toString());
        response.setModel(drone.getModel());
        response.setCapacity(drone.getCapacity());
        response.setBattery(drone.getBattery());
        response.setStatus(drone.getStatus());

        return response;
    }
}
