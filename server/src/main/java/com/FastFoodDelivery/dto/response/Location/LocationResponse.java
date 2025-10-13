package com.FastFoodDelivery.dto.response.Location;

import com.FastFoodDelivery.entity.Location;
import lombok.Data;
import org.bson.types.ObjectId;

import java.util.Date;

@Data
public class LocationResponse {
    private String locationId;
    private String droneId;
    private double latitude;
    private double longitude;
    private Date recordedAt;
    private long timestamp;

    public static LocationResponse fromEntity(Location location){
        LocationResponse response = new LocationResponse();
        response.setLocationId(location.getLocationId().toString());
        response.setDroneId(location.getDroneId().toString());
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setRecordedAt(location.getRecordedAt());
        response.setTimestamp(location.getTimestamp());

        return response;
    }
}
