package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.FastFoodDelivery.entity.AccountRestaurantDetail;
import com.FastFoodDelivery.repository.AccountRestaurantDetailRepository;
import com.FastFoodDelivery.service.AccountRestaurantDetailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountRestaurantDetailServiceImpl implements AccountRestaurantDetailService {
    
    private final AccountRestaurantDetailRepository repository;
    
    @Override
    public AccountRestaurantDetail createOrUpdateAccountDetail(ObjectId userId, ObjectId restaurantId, AccountRestaurantDetail detail) {
        // Check if exists
        Optional<AccountRestaurantDetail> existing = repository.findByUserId(userId);
        
        if (existing.isPresent()) {
            // Update existing
            AccountRestaurantDetail current = existing.get();
            current.setRepresentativeName(detail.getRepresentativeName());
            current.setRepresentativeEmail(detail.getRepresentativeEmail());
            current.setRepresentativePhone(detail.getRepresentativePhone());
            current.setAlternatePhone(detail.getAlternatePhone());
            current.setCccdImages(detail.getCccdImages());
            current.setBusinessLicenseImages(detail.getBusinessLicenseImages());
            current.setUpdatedAt(new Date());
            return repository.save(current);
        } else {
            // Create new
            detail.setUserId(userId);
            detail.setRestaurantId(restaurantId);
            detail.setVerificationStatus("pending");
            detail.setCreatedAt(new Date());
            detail.setUpdatedAt(new Date());
            return repository.save(detail);
        }
    }
    
    @Override
    public AccountRestaurantDetail updateAccountDetail(AccountRestaurantDetail detail) {
        detail.setUpdatedAt(new Date());
        return repository.save(detail);
    }
    
    @Override
    public Optional<AccountRestaurantDetail> getByUserId(ObjectId userId) {
        return repository.findByUserId(userId);
    }
    
    @Override
    public Optional<AccountRestaurantDetail> getById(ObjectId accountDetailId) {
        return repository.findById(accountDetailId);
    }
    
    @Override
    public Optional<AccountRestaurantDetail> getByRestaurantId(ObjectId restaurantId) {
        return repository.findByRestaurantId(restaurantId);
    }
    
    @Override
    public List<AccountRestaurantDetail> getByVerificationStatus(String verificationStatus) {
        return repository.findByVerificationStatus(verificationStatus);
    }
    
    @Override
    public AccountRestaurantDetail approveVerification(ObjectId accountDetailId, String approvalNote) {
        AccountRestaurantDetail detail = repository.findById(accountDetailId)
                .orElseThrow(() -> new IllegalArgumentException("Account detail not found: " + accountDetailId));
        
        detail.setVerificationStatus("approved");
        detail.setApprovedAt(new Date());
        detail.setUpdatedAt(new Date());
        
        return repository.save(detail);
    }
    
    @Override
    public AccountRestaurantDetail rejectVerification(ObjectId accountDetailId, String rejectionNote) {
        AccountRestaurantDetail detail = repository.findById(accountDetailId)
                .orElseThrow(() -> new IllegalArgumentException("Account detail not found: " + accountDetailId));
        
        detail.setVerificationStatus("rejected");
        detail.setUpdatedAt(new Date());
        
        return repository.save(detail);
    }
    
    @Override
    public void deleteByUserId(ObjectId userId) {
        Optional<AccountRestaurantDetail> detail = repository.findByUserId(userId);
        detail.ifPresent(repository::delete);
    }
    
    @Override
    public void deleteByRestaurantId(ObjectId restaurantId) {
        Optional<AccountRestaurantDetail> detail = repository.findByRestaurantId(restaurantId);
        detail.ifPresent(repository::delete);
    }
    
    @Override
    public boolean isVerified(ObjectId restaurantId) {
        Optional<AccountRestaurantDetail> detail = repository.findByRestaurantId(restaurantId);
        return detail.isPresent() && "approved".equals(detail.get().getVerificationStatus());
    }
}
