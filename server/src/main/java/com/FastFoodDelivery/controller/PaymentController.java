package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.dto.response.Payment.PaymentResponse;
import com.FastFoodDelivery.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    /**
     * ✅ API tạo thanh toán VNPay
     * Frontend sẽ gọi endpoint này để nhận về paymentUrl
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpServletRequest
    ) {
        PaymentResponse response = paymentService.createPayment(request, httpServletRequest);
        return ResponseEntity.ok(response);
    }
}
