package com.FastFoodDelivery.dto.response.AccountRestaurantDetail;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.FastFoodDelivery.entity.AccountRestaurantDetail;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountRestaurantDetailResponse {
    private String accountDetailId;
    private String userId;
    private String restaurantId;
    // Thông tin người đại diện sẽ được lấy từ User entity thông qua userId
    private List<CCCDDocumentResponse> cccdImages;
    private List<String> businessLicenseImages;
    private String verificationStatus;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date approvedAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private Date updatedAt;
    
    public static AccountRestaurantDetailResponse fromEntity(AccountRestaurantDetail entity) {
        AccountRestaurantDetailResponse response = new AccountRestaurantDetailResponse();
        response.setAccountDetailId(entity.getId().toString());
        response.setUserId(entity.getUserId().toString());
        response.setRestaurantId(entity.getRestaurantId().toString());
        
        // Convert CCCD images
        if (entity.getCccdImages() != null) {
            response.setCccdImages(entity.getCccdImages().stream()
                    .map(CCCDDocumentResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        response.setBusinessLicenseImages(entity.getBusinessLicenseImages());
        response.setVerificationStatus(entity.getVerificationStatus());
        response.setApprovedAt(entity.getApprovedAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        return response;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CCCDDocumentResponse {
        private String side;
        private String url;
        
        public static CCCDDocumentResponse fromEntity(AccountRestaurantDetail.CCCDDocument entity) {
            return new CCCDDocumentResponse(entity.getSide(), entity.getUrl());
        }
    }
}
