package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Location.CreateLocationRequest;
import com.FastFoodDelivery.dto.response.Location.LocationResponse;

public interface LocationService {
    LocationResponse updateDroneLocation(CreateLocationRequest location);
    LocationResponse getDroneLocation(String droneId);
}
