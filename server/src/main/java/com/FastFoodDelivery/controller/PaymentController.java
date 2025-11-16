package com.FastFoodDelivery.controller;

import java.util.Date;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.FastFoodDelivery.dto.request.Payment.CreatePaymentRequest;
import com.FastFoodDelivery.dto.response.Delivery.DeliveryResponse;
import com.FastFoodDelivery.dto.response.Payment.PaymentResponse;
import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.repository.OrderRepository;
import com.FastFoodDelivery.repository.PaymentRepository;
import com.FastFoodDelivery.service.CartService;
import com.FastFoodDelivery.service.DeliveryService;
import com.FastFoodDelivery.service.PaymentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private DeliveryService deliveryService;

    /**
     * ✅ API tạo thanh toán VNPay
     * Frontend sẽ gọi endpoint này để nhận về paymentUrl
     */
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpServletRequest
    ) {
        PaymentResponse response = paymentService.createPayment(request, httpServletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * ✅ Alias endpoint - POST /api/payments/create
     * For compatibility with frontend vnpayService
     */
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPaymentAlias(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpServletRequest
    ) {
        PaymentResponse response = paymentService.createPayment(request, httpServletRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * ✅ Callback từ VNPay sau khi thanh toán
     * VNPay sẽ redirect về đây với các query params
     * ✅ Cập nhật order status và clear cart khi thanh toán thành công
     */
    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        System.out.println("🔔 ===== VNPAY CALLBACK RECEIVED =====");
        
        // Lấy tất cả parameters từ VNPay
        String vnpResponseCode = request.getParameter("vnp_ResponseCode");
        String vnpOrderInfo = request.getParameter("vnp_OrderInfo"); // Chứa orderId
        String vnpTransactionNo = request.getParameter("vnp_TransactionNo");
        String vnpBankCode = request.getParameter("vnp_BankCode");
        String vnpTxnRef = request.getParameter("vnp_TxnRef"); // Để xác định Payment cụ thể
        
        System.out.println("📋 ResponseCode: " + vnpResponseCode);
        System.out.println("📋 OrderInfo: " + vnpOrderInfo);
        System.out.println("📋 TxnRef: " + vnpTxnRef);
        
        // Extract orderId from vnp_OrderInfo (format: "Thanh toan don hang: {orderId}")
        String orderId = null;
        if (vnpOrderInfo != null && vnpOrderInfo.contains(":")) {
            orderId = vnpOrderInfo.split(":")[1].trim();
        }
        
        System.out.println("📋 Extracted OrderId: " + orderId);
        
        // 00 = Success, khác 00 = Failed/Cancelled
        if ("00".equals(vnpResponseCode) && orderId != null) {
            // ✅ Thanh toán thành công
            System.out.println("✅ Payment SUCCESS detected for order: " + orderId);
            try {
                ObjectId orderObjectId = new ObjectId(orderId);
                Order order = orderRepository.findByOrderId(orderObjectId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
                
                // 1. ✅ Update Payment status: PENDING -> SUCCESS (tìm bằng vnpTxnRef)
                Payment payment = paymentRepository.findByVnpTxnRef(vnpTxnRef)
                    .orElse(null);
                
                if (payment != null && "PENDING".equals(payment.getStatus())) {
                    payment.setStatus("SUCCESS");
                    payment.setTransactionNo(vnpTransactionNo);
                    payment.setBankCode(vnpBankCode);
                    payment.setVnpResponseCode(vnpResponseCode);
                    payment.setPayDate(new Date());
                    payment.setUpdatedAt(new Date());
                    paymentRepository.save(payment);
                    System.out.println("✅ Payment status updated to SUCCESS for order: " + orderId);
                } else if (payment == null) {
                    System.err.println("⚠️ Payment record not found for TxnRef: " + vnpTxnRef);
                } else {
                    System.out.println("ℹ️ Payment already processed with status: " + payment.getStatus());
                }
                
                // 2. ✅ Update Order status: PENDING -> CONFIRMED
                if ("PENDING".equals(order.getStatus())) {
                    order.setStatus("CONFIRMED");
                    order.setUpdatedAt(new Date());
                    orderRepository.save(order);
                    System.out.println("✅ Order status updated to CONFIRMED for order: " + orderId);
                } else {
                    System.out.println("ℹ️ Order already in status: " + order.getStatus());
                }
                
                // 3. ✅ Clear user's cart
                ObjectId customerId = order.getCustomerId();
                if (customerId != null) {
                    cartService.clearUserCarts(customerId);
                    System.out.println("✅ Cart cleared for customer: " + customerId);
                }
                
                // 4. ✅ Create Delivery with geocoded coordinates from Order address
                try {
                    System.out.println("🚁 Attempting to create delivery for order: " + orderId);
                    System.out.println("📍 Order status: " + order.getStatus());
                    System.out.println("📍 Address: " + order.getDeliveryAddress() + ", " + order.getWard() + ", " + order.getCity());
                    
                    DeliveryResponse deliveryResponse = deliveryService.createDeliveryFromOrder(orderObjectId);
                    System.out.println("✅ Delivery created successfully with ID: " + deliveryResponse.getDeliveryId());
                } catch (IllegalStateException e) {
                    // Order chưa CONFIRMED - log nhưng không throw
                    System.err.println("⚠️ Cannot create delivery: " + e.getMessage());
                    System.err.println("Order status is: " + order.getStatus() + ", expected: CONFIRMED");
                } catch (Exception e) {
                    // Log detailed error
                    System.err.println("❌ Failed to create delivery for order " + orderId);
                    System.err.println("Error type: " + e.getClass().getName());
                    System.err.println("Error message: " + e.getMessage());
                    e.printStackTrace();
                    // Delivery có thể tạo sau bằng tay hoặc retry
                }
                
            } catch (Exception e) {
                // Log error but still redirect to success page
                System.err.println("❌ Error in payment callback: " + e.getMessage());
                e.printStackTrace();
            }
            
            return new RedirectView("http://localhost:5173/order-success?orderId=" + orderId);
        } else {
            // ❌ Thanh toán thất bại hoặc hủy
            System.out.println("❌ Payment failed or cancelled. ResponseCode: " + vnpResponseCode);
            
            if (vnpTxnRef != null) {
                try {
                    // Update Payment status to FAILED (tìm bằng vnpTxnRef)
                    Payment payment = paymentRepository.findByVnpTxnRef(vnpTxnRef).orElse(null);
                    if (payment != null && "PENDING".equals(payment.getStatus())) {
                        payment.setStatus("FAILED");
                        payment.setVnpResponseCode(vnpResponseCode);
                        payment.setUpdatedAt(new Date());
                        paymentRepository.save(payment);
                        System.out.println("❌ Payment status updated to FAILED for TxnRef: " + vnpTxnRef);
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error updating failed payment: " + e.getMessage());
                }
            }
            
            return new RedirectView("http://localhost:5173/customer/orders/" + orderId + "?payment=failed");
        }
    }
}
