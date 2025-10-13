package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.response.Location.LocationResponse;

public interface LocationService {
    LocationResponse updateDroneLocation(LocationResponse location);
    LocationResponse getDroneLocation(String droneId);
}
