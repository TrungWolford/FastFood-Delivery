package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
     import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import org.bson.types.ObjectId;

import java.util.List;

public interface DeliveryService {
    List<DeliveryResponse> getALlDeliveriesByOrderId(ObjectId orderId);
    List<DeliveryResponse> getAllDeliveriesByDroneIdAndRestaurantId(ObjectId droneId, ObjectId restaurantId);
    DeliveryResponse getByDeliveryId(ObjectId deliveryId);
    DeliveryResponse createDelivery(CreateDeliveryRequest request);
    DeliveryResponse updateDelivery(UpdateDeliveryRequest request, ObjectId deliveryId);
    void changeStatus(UpdateStatusDeliveryRequest request, ObjectId deliveryId);
}
