package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import com.FastFoodDelivery.entity.Delivery;
import com.FastFoodDelivery.entity.Delivery.LocationPoint;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.DeliveryRepository;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.DeliveryService;
import com.FastFoodDelivery.service.GeocodingService;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private GeocodingService geocodingService;

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
    
    /**
     * ✅ NEW: Tạo Delivery tự động từ Order sau khi thanh toán thành công
     */
    @Override
    public DeliveryResponse createDeliveryFromOrder(ObjectId orderId) throws Exception {
        System.out.println("📦 [DeliveryService] Starting createDeliveryFromOrder for orderId: " + orderId);
        
        // 1. Validate Order exists and status is CONFIRMED
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        System.out.println("📦 [DeliveryService] Order found with status: " + order.getStatus());
        
        if (!"CONFIRMED".equals(order.getStatus())) {
            throw new IllegalStateException("Order phải ở trạng thái CONFIRMED mới có thể tạo Delivery");
        }
        
        // 2. Get Restaurant location (startLocation)
        System.out.println("📦 [DeliveryService] Getting restaurant location for restaurantId: " + order.getRestaurantId());
        Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", order.getRestaurantId().toString()));
        
        System.out.println("📦 [DeliveryService] Restaurant location: lat=" + restaurant.getLatitude() + ", lon=" + restaurant.getLongitude());
        
        // Check if restaurant has valid coordinates
        LocationPoint startLocation;
        if (restaurant.getLatitude() == 0.0 && restaurant.getLongitude() == 0.0) {
            System.out.println("⚠️ [DeliveryService] Restaurant has no coordinates, geocoding restaurant address...");
            
            // Geocode restaurant address
            String restaurantAddress = restaurant.getAddress() + ", " + restaurant.getCity();
            System.out.println("📍 [DeliveryService] Restaurant address: " + restaurantAddress);
            
            try {
                startLocation = geocodingService.geocode(restaurantAddress);
                
                // Update restaurant coordinates for future use
                restaurant.setLatitude(startLocation.getLatitude());
                restaurant.setLongitude(startLocation.getLongitude());
                restaurantRepository.save(restaurant);
                
                System.out.println("✅ [DeliveryService] Restaurant coordinates updated: lat=" + startLocation.getLatitude() + ", lon=" + startLocation.getLongitude());
            } catch (Exception e) {
                System.err.println("❌ [DeliveryService] Failed to geocode restaurant address: " + e.getMessage());
                throw new Exception("Không thể xác định tọa độ nhà hàng. Vui lòng cập nhật địa chỉ chính xác cho nhà hàng.", e);
            }
        } else {
            startLocation = new LocationPoint(
                restaurant.getLatitude(),
                restaurant.getLongitude()
            );
        }
        
        // 3. Geocode customer address to get coordinates (endLocation)
        // Sau sáp nhập hành chính 2025, không còn quận/huyện
        String fullAddress = String.format("%s, %s, %s",
            order.getDeliveryAddress(),
            order.getWard(),
            order.getCity()
        );
        
        System.out.println("📦 [DeliveryService] Geocoding customer address: " + fullAddress);
        LocationPoint endLocation = geocodingService.geocode(fullAddress);
        System.out.println("📦 [DeliveryService] Customer location: lat=" + endLocation.getLatitude() + ", lon=" + endLocation.getLongitude());
        
        // 4. Create Delivery
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setStartLocation(startLocation);
        delivery.setEndLocation(endLocation);
        delivery.setStatus(0); // 0 = Pending
        delivery.setDeliveredAt(null); // Chưa giao
        
        Delivery savedDelivery = deliveryRepository.save(delivery);
        System.out.println("✅ [DeliveryService] Delivery created successfully with ID: " + savedDelivery.getDeliveryId());
        
        return DeliveryResponse.fromEntity(savedDelivery);
    }
}
