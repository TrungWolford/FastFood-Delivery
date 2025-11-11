package com.FastFoodDelivery.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.FastFoodDelivery.dto.request.AccountRestaurantDetail.CreateAccountRestaurantDetailRequest;
import com.FastFoodDelivery.dto.request.AccountRestaurantDetail.UpdateAccountRestaurantDetailRequest;
import com.FastFoodDelivery.dto.response.AccountRestaurantDetail.AccountRestaurantDetailResponse;
import com.FastFoodDelivery.entity.AccountRestaurantDetail;
import com.FastFoodDelivery.service.AccountRestaurantDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/account-restaurant-details")
@RequiredArgsConstructor
public class AccountRestaurantDetailController {
    
    private final AccountRestaurantDetailService service;
    
    // Create account detail
    @PostMapping
    public ResponseEntity<AccountRestaurantDetailResponse> createAccountDetail(
            @RequestBody CreateAccountRestaurantDetailRequest request) {
        try {
            AccountRestaurantDetail entity = new AccountRestaurantDetail();
            entity.setUserId(request.getUserId());
            entity.setRestaurantId(request.getRestaurantId());
            entity.setRepresentativeName(request.getRepresentativeName());
            entity.setRepresentativeEmail(request.getRepresentativeEmail());
            entity.setRepresentativePhone(request.getRepresentativePhone());
            entity.setAlternatePhone(request.getAlternatePhone());
            
            // Convert CCCD images
            if (request.getCccdImages() != null) {
                entity.setCccdImages(request.getCccdImages().stream()
                        .map(dto -> new AccountRestaurantDetail.CCCDDocument(dto.getSide(), dto.getUrl()))
                        .collect(Collectors.toList()));
            }
            
            entity.setBusinessLicenseImages(request.getBusinessLicenseImages());
            
            AccountRestaurantDetail result = service.createOrUpdateAccountDetail(
                    request.getUserId(),
                    request.getRestaurantId(),
                    entity
            );
            return new ResponseEntity<>(AccountRestaurantDetailResponse.fromEntity(result), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Update account detail
    @PutMapping("/{accountDetailId}")
    public ResponseEntity<AccountRestaurantDetailResponse> updateAccountDetail(
            @PathVariable String accountDetailId,
            @RequestBody UpdateAccountRestaurantDetailRequest request) {
        try {
            AccountRestaurantDetail existing = service.getById(new ObjectId(accountDetailId))
                    .orElseThrow(() -> new IllegalArgumentException("Account detail not found"));
            
            existing.setRepresentativeName(request.getRepresentativeName());
            existing.setRepresentativeEmail(request.getRepresentativeEmail());
            existing.setRepresentativePhone(request.getRepresentativePhone());
            existing.setAlternatePhone(request.getAlternatePhone());
            
            // Convert CCCD images
            if (request.getCccdImages() != null) {
                existing.setCccdImages(request.getCccdImages().stream()
                        .map(dto -> new AccountRestaurantDetail.CCCDDocument(dto.getSide(), dto.getUrl()))
                        .collect(Collectors.toList()));
            }
            
            existing.setBusinessLicenseImages(request.getBusinessLicenseImages());
            
            AccountRestaurantDetail result = service.updateAccountDetail(existing);
            return ResponseEntity.ok(AccountRestaurantDetailResponse.fromEntity(result));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<AccountRestaurantDetailResponse> getByUserId(@PathVariable String userId) {
        try {
            return service.getByUserId(new ObjectId(userId))
                    .map(entity -> ResponseEntity.ok(AccountRestaurantDetailResponse.fromEntity(entity)))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get by restaurantId
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<AccountRestaurantDetailResponse> getByRestaurantId(@PathVariable String restaurantId) {
        try {
            return service.getByRestaurantId(new ObjectId(restaurantId))
                    .map(entity -> ResponseEntity.ok(AccountRestaurantDetailResponse.fromEntity(entity)))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get pending verifications (Admin only)
    @GetMapping("/verification/pending")
    public ResponseEntity<List<AccountRestaurantDetailResponse>> getPendingVerifications() {
        try {
            List<AccountRestaurantDetailResponse> result = service.getByVerificationStatus("pending")
                    .stream()
                    .map(AccountRestaurantDetailResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get approved verifications (Admin only)
    @GetMapping("/verification/approved")
    public ResponseEntity<List<AccountRestaurantDetailResponse>> getApprovedVerifications() {
        try {
            List<AccountRestaurantDetailResponse> result = service.getByVerificationStatus("approved")
                    .stream()
                    .map(AccountRestaurantDetailResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get rejected verifications (Admin only)
    @GetMapping("/verification/rejected")
    public ResponseEntity<List<AccountRestaurantDetailResponse>> getRejectedVerifications() {
        try {
            List<AccountRestaurantDetailResponse> result = service.getByVerificationStatus("rejected")
                    .stream()
                    .map(AccountRestaurantDetailResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Approve verification (Admin only)
    @PutMapping("/{accountDetailId}/approve")
    public ResponseEntity<AccountRestaurantDetailResponse> approveVerification(
            @PathVariable String accountDetailId,
            @RequestBody Map<String, String> request) {
        try {
            String approvalNote = request.getOrDefault("note", "");
            AccountRestaurantDetail result = service.approveVerification(
                    new ObjectId(accountDetailId),
                    approvalNote
            );
            return ResponseEntity.ok(AccountRestaurantDetailResponse.fromEntity(result));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Reject verification (Admin only)
    @PutMapping("/{accountDetailId}/reject")
    public ResponseEntity<AccountRestaurantDetailResponse> rejectVerification(
            @PathVariable String accountDetailId,
            @RequestBody Map<String, String> request) {
        try {
            String rejectionNote = request.getOrDefault("note", "");
            AccountRestaurantDetail result = service.rejectVerification(
                    new ObjectId(accountDetailId),
                    rejectionNote
            );
            return ResponseEntity.ok(AccountRestaurantDetailResponse.fromEntity(result));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Check if verified
    @GetMapping("/restaurant/{restaurantId}/is-verified")
    public ResponseEntity<Map<String, Boolean>> isVerified(@PathVariable String restaurantId) {
        try {
            boolean verified = service.isVerified(new ObjectId(restaurantId));
            return ResponseEntity.ok(Map.of("isVerified", verified));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Delete by userId
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteByUserId(@PathVariable String userId) {
        try {
            service.deleteByUserId(new ObjectId(userId));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    // Delete by restaurantId
    @DeleteMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Void> deleteByRestaurantId(@PathVariable String restaurantId) {
        try {
            service.deleteByRestaurantId(new ObjectId(restaurantId));
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
