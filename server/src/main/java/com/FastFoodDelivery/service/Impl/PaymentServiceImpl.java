package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.dto.response.Payment.PaymentResponse;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.repository.PaymentRepository;
import com.FastFoodDelivery.service.PaymentService;
import com.FastFoodDelivery.service.VNPayService;
import com.FastFoodDelivery.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

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
     */
    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpServletRequest) {
        // Kiểm tra order tồn tại và hợp lệ
        Order order = orderRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId().toString()));

        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalStateException("Order must be PENDING to create payment.");
        }

        // Tạo bản ghi payment
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus("PENDING");
        payment.setCreatedAt(new Date());
        payment.setUpdatedAt(new Date());
        paymentRepository.save(payment);

        String txnRef = request.getOrderId().toString() + "-" + System.currentTimeMillis() + "-" + VNPayUtil.getRandomNumber(6);
        payment.setVnpTxnRef(txnRef);

        // Save lần 1 để có record trong DB (nên có index unique trên vnpTxnRef)
        paymentRepository.save(payment);

        // Tạo URL thanh toán
        String paymentUrl = vnPayService.createPaymentUrl(payment, httpServletRequest);
        payment.setPaymentUrl(paymentUrl);
        paymentRepository.save(payment);

        return PaymentResponse.fromEntity(payment);
    }

    /**
     * ✅ Cập nhật trạng thái thanh toán sau khi nhận phản hồi từ VNPay
     */
    @Override
    public void updatePaymentStatus(String txnRef, boolean isSuccess) {
        Optional<Payment> optPayment = paymentRepository.findByVnpTxnRef(txnRef);
        if (optPayment.isEmpty()) {
            throw new ResourceNotFoundException("Payment", "vnp_TxnRef", txnRef);
        }

        Payment payment = optPayment.get();
        if (isSuccess) {
            payment.setStatus("SUCCESS");
        } else {
            payment.setStatus("FAILED");
        }
        payment.setUpdatedAt(new Date());
        paymentRepository.save(payment);

        // Nếu muốn cập nhật luôn Order tại đây:
         Order order = orderRepository.findByOrderId(payment.getOrderId()).orElse(null);
         if (order != null && isSuccess) { order.setStatus("PAID"); orderRepository.save(order); }
    }
}
