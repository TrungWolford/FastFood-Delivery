package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import com.FastFoodDelivery.entity.Delivery;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.DeliveryRepository;
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
        delivery.setStartLocation(request.getStartLocation());
        delivery.setEndLocation(request.getEndLocation());
        delivery.setStatus(request.getStatus());
        delivery.setDeliveredAt(request.getDeliveredAt());

        deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(delivery);
    }

    @Override
    public DeliveryResponse updateDelivery(UpdateDeliveryRequest request, ObjectId deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", deliveryId.toString()));

        delivery.setOrderId(request.getOrderId());
        delivery.setStartLocation(request.getStartLocation());
        delivery.setEndLocation(request.getEndLocation());
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
}
