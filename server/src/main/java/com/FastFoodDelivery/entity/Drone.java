package com.FastFoodDelivery.entity;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "drones")
@Data
public class Drone {
    @Id
    private ObjectId droneId;
    private ObjectId restaurantId;
    private String model;
    private double capacity;
    private double battery;
    private String status;
}
