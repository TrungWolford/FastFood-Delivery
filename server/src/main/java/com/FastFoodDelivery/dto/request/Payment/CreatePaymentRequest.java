package com.FastFoodDelivery.dto.request.Payment;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class CreatePaymentRequest {
    private ObjectId orderId;
    private long amount;
    private String method; // "VNPay"
}
