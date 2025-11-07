package com.FastFoodDelivery.controller;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.PaymentRepository;
import com.FastFoodDelivery.service.PaymentService;
import com.FastFoodDelivery.service.VNPayService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * ✅ Endpoint được VNPay redirect sau khi thanh toán xong (Return URL)
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleVNPayReturn(HttpServletRequest request) {
        try {
            // ✅ Lấy tất cả params từ request
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            // ✅ Xác minh checksum bằng VNPayService (consistent logic)
            if (!vnPayService.validateChecksum(fields)) {
                return ResponseEntity.badRequest().body("Chữ ký không hợp lệ");
            }

            String txnRef = fields.get("vnp_TxnRef");
            String responseCode = fields.get("vnp_ResponseCode");

            // Tìm payment
            Optional<Payment> optPayment = paymentRepository.findByVnpTxnRef(txnRef);
            if (optPayment.isEmpty()) {
                return ResponseEntity.badRequest().body("Payment not found");
            }

            Payment payment = optPayment.get();

            // ✅ Kiểm tra response code "00" = thành công
            boolean isSuccess = "00".equals(responseCode);

            // ✅ Kiểm tra số tiền khớp
            if (isSuccess) {
                long vnpAmount = Long.parseLong(fields.get("vnp_Amount")) / 100L;
                if (vnpAmount != payment.getAmount()) {
                    isSuccess = false;
                }
            }

            // Cập nhật trạng thái
            paymentService.updatePaymentStatus(txnRef, isSuccess);

            String message = isSuccess
                    ? "GD Thanh cong"
                    : "GD Khong thanh cong";

            return ResponseEntity.ok(message);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body("Payment not found: " + e.getMessage());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid amount format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing payment: " + e.getMessage());
        }
    }
}
