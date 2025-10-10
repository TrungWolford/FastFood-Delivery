package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.dto.response.Payment.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    PaymentResponse createPayment(CreatePaymentRequest req, HttpServletRequest httpServletRequest);
    void updatePaymentStatus(String txnRef, boolean isSuccess);
}
