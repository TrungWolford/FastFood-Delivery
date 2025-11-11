package com.FastFoodDelivery.service;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;

import com.FastFoodDelivery.entity.AccountRestaurantDetail;

public interface AccountRestaurantDetailService {
    
    // Create/Update
    AccountRestaurantDetail createOrUpdateAccountDetail(ObjectId userId, ObjectId restaurantId, AccountRestaurantDetail detail);
    AccountRestaurantDetail updateAccountDetail(AccountRestaurantDetail detail);
    
    // Get
    Optional<AccountRestaurantDetail> getById(ObjectId accountDetailId);
    Optional<AccountRestaurantDetail> getByUserId(ObjectId userId);
    Optional<AccountRestaurantDetail> getByRestaurantId(ObjectId restaurantId);
    
    // List by verification status
    List<AccountRestaurantDetail> getByVerificationStatus(String verificationStatus);
    
    // Verification
    AccountRestaurantDetail approveVerification(ObjectId accountDetailId, String approvalNote);
    AccountRestaurantDetail rejectVerification(ObjectId accountDetailId, String rejectionNote);
    
    // Delete
    void deleteByUserId(ObjectId userId);
    void deleteByRestaurantId(ObjectId restaurantId);
    
    // Check
    boolean isVerified(ObjectId restaurantId);
}
