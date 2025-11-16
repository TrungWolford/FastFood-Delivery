package com.FastFoodDelivery.service.Impl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.FastFoodDelivery.entity.Delivery.LocationPoint;
import com.FastFoodDelivery.service.GeocodingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Implementation của GeocodingService sử dụng OpenStreetMap Nominatim API
 * API Documentation: https://nominatim.org/release-docs/latest/api/Search/
 */
@Service
public class GeocodingServiceImpl implements GeocodingService {
    
    private static final String NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public GeocodingServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public LocationPoint geocode(String address) throws Exception {
        try {
            // Encode address with UTF-8
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            
            // Build URL manually to ensure proper encoding
            String url = NOMINATIM_API_URL + 
                "?q=" + encodedAddress +
                "&format=json" +
                "&limit=1" +
                "&countrycodes=VN";
            
            System.out.println("🌍 [GeocodingService] Calling Nominatim API with URL: " + url);
            
            // Call Nominatim API
            String response = restTemplate.getForObject(url, String.class);
            
            System.out.println("🌍 [GeocodingService] API Response: " + response);
            
            // Parse JSON response
            JsonNode jsonArray = objectMapper.readTree(response);
            
            if (jsonArray == null || jsonArray.isEmpty()) {
                throw new Exception("Không tìm thấy tọa độ cho địa chỉ: " + address);
            }
            
            // Get first result
            JsonNode firstResult = jsonArray.get(0);
            double latitude = firstResult.get("lat").asDouble();
            double longitude = firstResult.get("lon").asDouble();
            
            System.out.println("✅ [GeocodingService] Found coordinates: lat=" + latitude + ", lon=" + longitude);
            
            return new LocationPoint(latitude, longitude);
            
        } catch (Exception e) {
            System.err.println("❌ [GeocodingService] Error geocoding address: " + address);
            System.err.println("❌ Error details: " + e.getMessage());
            throw new Exception("Lỗi khi geocode địa chỉ: " + address + ". Error: " + e.getMessage(), e);
        }
    }
}
