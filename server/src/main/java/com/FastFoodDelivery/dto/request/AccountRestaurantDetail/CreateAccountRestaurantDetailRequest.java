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
    private ObjectId userId;
    private ObjectId restaurantId;
    private String representativeName;
    private String representativeEmail;
    private String representativePhone;
    private String alternatePhone;
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
