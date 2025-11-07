package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.dto.response.Payment.PaymentResponse;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.repository.PaymentRepository;
import com.FastFoodDelivery.service.PaymentService;
import com.FastFoodDelivery.service.VNPayService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VNPayService vnPayService;

    /**
     * ✅ Tạo thanh toán VNPay (lưu DB & trả URL thanh toán)
     * ✅ Transactional: Tất cả saves hoàn thành hoặc không có gì hoàn thành
     */
    @Transactional
    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpServletRequest) {
        // Kiểm tra order tồn tại và hợp lệ
        Order order = orderRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId().toString()));

        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalStateException("Order must be PENDING to create payment.");
        }

        // Tạo bản ghi payment với TxnRef duy nhất (UUID)
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus("PENDING");
        payment.setCreatedAt(new Date());
        payment.setUpdatedAt(new Date());
        
        // ✅ Tạo TxnRef duy nhất bằng UUID (thay vì random 6 digits)
        String txnRef = request.getOrderId().toString() + "-" + UUID.randomUUID().toString().substring(0, 8);
        payment.setVnpTxnRef(txnRef);

        // Save ngay để có record trong DB
        Payment savedPayment = paymentRepository.save(payment);

        // Tạo URL thanh toán
        String paymentUrl = vnPayService.createPaymentUrl(savedPayment, httpServletRequest);
        savedPayment.setPaymentUrl(paymentUrl);
        
        // ✅ Save lần nữa với URL (tất cả trong một transaction)
        paymentRepository.save(savedPayment);

        return PaymentResponse.fromEntity(savedPayment);
    }

    /**
     * ✅ Cập nhật trạng thái thanh toán sau khi nhận phản hồi từ VNPay
     * ✅ Idempotent: Không cập nhật lại nếu đã xử lý thành công
     */
    @Override
    public void updatePaymentStatus(String txnRef, boolean isSuccess) {
        Optional<Payment> optPayment = paymentRepository.findByVnpTxnRef(txnRef);
        if (optPayment.isEmpty()) {
            throw new ResourceNotFoundException("Payment", "vnp_TxnRef", txnRef);
        }

        Payment payment = optPayment.get();
        
        // ✅ Nếu đã xử lý trước đó, không cập nhật lại (idempotent)
        if (!"PENDING".equals(payment.getStatus())) {
            return;
        }
        
        if (isSuccess) {
            payment.setStatus("SUCCESS");
        } else {
            payment.setStatus("FAILED");
        }
        payment.setUpdatedAt(new Date());
        paymentRepository.save(payment);

        // Nếu muốn cập nhật luôn Order tại đây:
        Order order = orderRepository.findByOrderId(payment.getOrderId()).orElse(null);
        if (order != null && "PENDING".equals(order.getStatus())) {
            if (isSuccess) {
                order.setStatus("CONFIRMED");
            } else {
                order.setStatus("CANCELLED");
            }
            order.setUpdatedAt(new Date());
            orderRepository.save(order);
        }
    }
}
