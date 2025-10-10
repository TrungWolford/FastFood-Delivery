package com.FastFoodDelivery.dto.response.Payment;

import com.FastFoodDelivery.entity.Payment;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

@Data
public class PaymentResponse {
    private String paymentId;
    private String orderId;
    private long amount;
    private String method;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date updatedAt;

    private String transactionNo;
    private String bankCode;
    private String vnpResponseCode;
    private String paymentUrl;  // link redirect sang VNPay

    public static PaymentResponse fromEntity(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId().toString());
        response.setOrderId(payment.getOrderId().toString());
        response.setAmount(payment.getAmount());
        response.setMethod(payment.getMethod());
        response.setStatus(payment.getStatus());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());

        response.setTransactionNo(payment.getTransactionNo());
        response.setBankCode(payment.getBankCode());
        response.setVnpResponseCode(payment.getVnpResponseCode());
        response.setPaymentUrl(payment.getPaymentUrl());

        return response;
    }
}
