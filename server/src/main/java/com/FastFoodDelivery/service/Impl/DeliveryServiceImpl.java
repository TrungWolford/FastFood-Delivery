package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import com.FastFoodDelivery.entity.Delivery;
import com.FastFoodDelivery.entity.Drone;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.DeliveryRepository;
import com.FastFoodDelivery.repository.DroneRepository;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.service.DeliveryService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private DroneRepository droneRepository;

    @Override
    public List<DeliveryResponse> getALlDeliveriesByOrderId(ObjectId orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        List<Delivery> deliveries = deliveryRepository.findAllByOrderId(orderId);
        return deliveries.stream().map(DeliveryResponse::fromEntity).toList();
    }

    @Override
    public DeliveryResponse getByDeliveryId(ObjectId deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", deliveryId.toString()));
        return DeliveryResponse.fromEntity(delivery);
    }

    @Override
    public DeliveryResponse createDelivery(CreateDeliveryRequest request) {
        Delivery delivery = new Delivery();
        delivery.setDroneId(request.getDroneId());
        delivery.setOrderId(request.getOrderId());
        
        // Convert LocationPoint from Request to Entity
        if (request.getStartLocation() != null) {
            delivery.setStartLocation(new Delivery.LocationPoint(
                request.getStartLocation().getLatitude(),
                request.getStartLocation().getLongitude()
            ));
        }
        if (request.getEndLocation() != null) {
            delivery.setEndLocation(new Delivery.LocationPoint(
                request.getEndLocation().getLatitude(),
                request.getEndLocation().getLongitude()
            ));
        }
        
        delivery.setStatus(0);
        delivery.setDeliveredAt(new Date());

        deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(delivery);
    }

    @Override
    public DeliveryResponse updateDelivery(UpdateDeliveryRequest request, ObjectId deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", deliveryId.toString()));

        delivery.setOrderId(request.getOrderId());
        
        // Convert LocationPoint from Request to Entity
        if (request.getStartLocation() != null) {
            delivery.setStartLocation(new Delivery.LocationPoint(
                request.getStartLocation().getLatitude(),
                request.getStartLocation().getLongitude()
            ));
        }
        if (request.getEndLocation() != null) {
            delivery.setEndLocation(new Delivery.LocationPoint(
                request.getEndLocation().getLatitude(),
                request.getEndLocation().getLongitude()
            ));
        }
        
        delivery.setStatus(request.getStatus());
        delivery.setDeliveredAt(new Date());

        deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(delivery);
    }

    @Override
    public void changeStatus(UpdateStatusDeliveryRequest request, ObjectId deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", deliveryId.toString()));

       delivery.setStatus(request.getStatus());
       deliveryRepository.save(delivery);
    }
    
    @Override
    public List<DeliveryResponse> getAllDeliveriesByDroneIdAndRestaurantId(ObjectId droneId, ObjectId restaurantId) {
        try {
            // Verify that the drone belongs to the restaurant
            Drone drone = droneRepository.findById(droneId)
                    .orElseThrow(() -> new ResourceNotFoundException("Drone", "id", droneId.toString()));
            
            // Check if drone belongs to the restaurant
            if (!drone.getRestaurantId().equals(restaurantId)) {
                throw new IllegalArgumentException("Drone does not belong to this restaurant");
            }
            
            // Get all deliveries for this drone
            List<Delivery> deliveries = deliveryRepository.findAllByDroneId(droneId);
            
            // Filter out any null deliveries and convert to response
            return deliveries.stream()
                    .filter(delivery -> delivery != null && 
                                       delivery.getDroneId() != null && 
                                       delivery.getOrderId() != null)
                    .map(DeliveryResponse::fromEntity)
                    .toList();
        } catch (ResourceNotFoundException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error in getAllDeliveriesByDroneIdAndRestaurantId: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching deliveries: " + e.getMessage(), e);
        }
    }
}
