package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.config.VNPayConfig;
import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.repository.PaymentRepository;
import com.FastFoodDelivery.service.PaymentService;
import com.FastFoodDelivery.service.VNPayService;
import com.FastFoodDelivery.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
        // ✅ Lấy tất cả params từ request
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        // 🔍 DEBUG: In ra tất cả params nhận được
        System.out.println("=== VNPAY RETURN PARAMS ===");
        fields.forEach((key, value) -> System.out.println(key + " = " + value));

        String receivedHash = fields.get("vnp_SecureHash");
        System.out.println("\n=== RECEIVED HASH ===");
        System.out.println(receivedHash);

        // Tạo lại hash để so sánh
        Map<String, String> fieldsToHash = new HashMap<>(fields);
        fieldsToHash.remove("vnp_SecureHash");
        fieldsToHash.remove("vnp_SecureHashType");

        // In ra chuỗi data trước khi hash
        List<String> fieldNames = new ArrayList<>(fieldsToHash.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = fieldsToHash.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append('=');
                sb.append(fieldValue);
                sb.append('&');
            }
        }
        if (sb.length() > 0) {
            sb.deleteCharAt(sb.length() - 1);
        }

        System.out.println("\n=== HASH DATA STRING ===");
        System.out.println(sb.toString());

        System.out.println("\n=== SECRET KEY ===");
        System.out.println(VNPayConfig.vnp_HashSecret);

        String computedHash = VNPayUtil.hmacSHA512(VNPayConfig.vnp_HashSecret, sb.toString());
        System.out.println("\n=== COMPUTED HASH ===");
        System.out.println(computedHash);

        System.out.println("\n=== COMPARISON ===");
        System.out.println("Received:  " + receivedHash);
        System.out.println("Computed:  " + computedHash);
        System.out.println("Match:     " + computedHash.equalsIgnoreCase(receivedHash));

        // Xác minh checksum
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
    }
}
