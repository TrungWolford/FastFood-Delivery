package com.FastFoodDelivery.service;

import java.util.List;

import org.bson.types.ObjectId;

import com.FastFoodDelivery.dto.request.Delivery.CreateDeliveryRequest;
     import com.FastFoodDelivery.dto.request.Delivery.UpdateDeliveryRequest;
import com.FastFoodDelivery.dto.request.Delivery.UpdateStatusDeliveryRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;

public interface DeliveryService {
    List<DeliveryResponse> getALlDeliveriesByOrderId(ObjectId orderId);
    List<DeliveryResponse> getAllDeliveriesByDroneIdAndRestaurantId(ObjectId droneId, ObjectId restaurantId);
    DeliveryResponse getByDeliveryId(ObjectId deliveryId);
    DeliveryResponse createDelivery(CreateDeliveryRequest request);
    DeliveryResponse updateDelivery(UpdateDeliveryRequest request, ObjectId deliveryId);
    void changeStatus(UpdateStatusDeliveryRequest request, ObjectId deliveryId);
    
    /**
     * ✅ NEW: Tạo Delivery tự động từ Order sau khi thanh toán thành công
     * Sẽ geocode địa chỉ khách hàng và lấy tọa độ nhà hàng
     * @param orderId ID của Order đã được CONFIRMED
     * @return DeliveryResponse
     * @throws Exception nếu không tìm được tọa độ hoặc Order không hợp lệ
     */
    DeliveryResponse createDeliveryFromOrder(ObjectId orderId) throws Exception;
}
