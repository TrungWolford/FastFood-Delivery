package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "locations")
@Data
public class Location {
    @Id
    private ObjectId locationId;
    private ObjectId droneId;
    private double latitude;
    private double longitude;
    private Date recordedAt;
    private long timestamp;
}
