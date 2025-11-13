package com.FastFoodDelivery.dto.request.AccountRestaurantDetail;

import java.util.List;

import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccountRestaurantDetailRequest {
    private ObjectId userId; // Thông tin người đại diện lấy từ User entity
    private ObjectId restaurantId;
    private List<CCCDDocumentRequest> cccdImages;
    private List<String> businessLicenseImages;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CCCDDocumentRequest {
        private String side;    // "front" or "back"
        private String url;     // Image URL
    }
}
