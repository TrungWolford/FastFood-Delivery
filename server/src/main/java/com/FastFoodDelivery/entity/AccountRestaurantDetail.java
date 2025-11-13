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
    private ObjectId id;

    @Indexed(unique = true)
    private ObjectId userId; // FK → User._id (tài khoản chủ nhà hàng)

    private ObjectId restaurantId; // FK → Restaurant._id

    // Tài liệu xác minh (giấy tờ pháp lý)
    private List<CCCDDocument> cccdImages; // CMND/CCCD: mặt trước & mặt sau
    private List<String> businessLicenseImages; // Giấy phép kinh doanh (tối đa 10 ảnh)

    // Trạng thái xác minh
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    private Date approvedAt;

    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CCCDDocument {
        private String side; // "front" hoặc "back"
        private String url;  // Link ảnh
    }

    public enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
