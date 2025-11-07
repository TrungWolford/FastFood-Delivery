package com.FastFoodDelivery.dto.request.Payment;

import org.bson.types.ObjectId;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Order ID is required")
    private ObjectId orderId;
    
    @Min(value = 10000, message = "Minimum amount is 10,000 VND")
    @Max(value = 1_000_000_000L, message = "Maximum amount is 1 billion VND")
    private long amount;
    
    @NotBlank(message = "Payment method is required")
    private String method; // "VNPay"
}
