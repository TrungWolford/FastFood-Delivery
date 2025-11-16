package com.FastFoodDelivery.service;

import com.FastFoodDelivery.entity.Delivery.LocationPoint;

/**
 * Service để convert địa chỉ text thành tọa độ GPS
 * Sử dụng OpenStreetMap Nominatim API
 */
public interface GeocodingService {
    /**
     * Convert địa chỉ thành tọa độ GPS
     * @param address Địa chỉ đầy đủ
     * @return LocationPoint với latitude, longitude
     * @throws Exception nếu không tìm được tọa độ
     */
    LocationPoint geocode(String address) throws Exception;
}
