package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.entity.Payment;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {
    String createPaymentUrl(Payment payment, HttpServletRequest request);
    boolean validateChecksum(Map<String, String> params);
    boolean isPaymentSuccess(Map<String, String> params, Payment payment);
}
