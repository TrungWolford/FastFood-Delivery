package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Drone.CreateDroneRequest;
import com.FastFoodDelivery.dto.request.Drone.UpdateDroneRequest;
import com.FastFoodDelivery.dto.response.Drone.DroneResponse;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DroneService {
     Page<DroneResponse> getAllDroneByRestaurantId(Pageable pageable, ObjectId restaurantId);
     DroneResponse getByDroneId(ObjectId droneId);
     DroneResponse createDrone(CreateDroneRequest request);
     DroneResponse updateDrone(UpdateDroneRequest request, ObjectId droneId);
     void deleteDrone(ObjectId droneId);
     void changeStatus(ObjectId droneId);
}
