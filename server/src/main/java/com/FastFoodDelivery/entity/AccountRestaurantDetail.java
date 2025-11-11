package com.FastFoodDelivery.entity;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "accountRestaurantDetails")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountRestaurantDetail {
    @Id
    private ObjectId accountDetailId;   // Primary Key - Account verification detail ID
    @Indexed(unique = true)
    private ObjectId userId;            // FK → User._id (One-to-one relationship with User)
    private ObjectId restaurantId;      // FK → Restaurant._id
    
    // Representative Information (from official documents)
    private String representativeName;
    private String representativeEmail;
    private String representativePhone;
    private String alternatePhone;
    
    // Documents (Images)
    private List<CCCDDocument> cccdImages;              // Front & Back
    private List<String> businessLicenseImages;         // Max 10 images
    
    // Verification Status
    private String verificationStatus;  // pending, approved, rejected
    private Date approvedAt;
    
    private Date createdAt;
    private Date updatedAt;
    
    // Inner class for CCCD document
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CCCDDocument {
        private String side;    // "front" or "back"
        private String url;     // Image URL
    }
}
