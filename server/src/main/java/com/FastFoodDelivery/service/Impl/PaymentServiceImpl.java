package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;
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
     * ✅ Reset payment expiration: Chỉ khi CHƯA hết hạn, reset lại 15 phút
     * ✅ Block retry nếu đã hết hạn thanh toán
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

        Date now = new Date();
        
        // ✅ Kiểm tra đơn hàng đã hết hạn thanh toán chưa
        if (order.getPaymentExpiresAt() != null && order.getPaymentExpiresAt().before(now)) {
            throw new IllegalStateException("Payment time has expired. Please cancel this order and create a new one.");
        }

        // ✅ Chuyển TẤT CẢ Payment PENDING cũ của Order này sang FAILED
        // Vì user đang tạo payment mới → các payment cũ không còn hiệu lực
        List<Payment> oldPendingPayments = paymentRepository.findAllByOrderIdAndStatus(
            request.getOrderId(), 
            "PENDING"
        );
        
        if (!oldPendingPayments.isEmpty()) {
            for (Payment oldPayment : oldPendingPayments) {
                oldPayment.setStatus("FAILED");
                oldPayment.setUpdatedAt(now);
                paymentRepository.save(oldPayment);
                System.out.println("⚠️ Old payment marked as FAILED: " + oldPayment.getPaymentId());
            }
            System.out.println("✅ Marked " + oldPendingPayments.size() + " old pending payment(s) as FAILED");
        }

        // ✅ Reset payment expiration time: 15 phút mới khi retry payment
        Date newPaymentExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        order.setPaymentExpiresAt(newPaymentExpiresAt);
        order.setUpdatedAt(now);
        orderRepository.save(order);

        // Tạo bản ghi payment MỚI với TxnRef duy nhất (UUID)
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus("PENDING");
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);
        
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
