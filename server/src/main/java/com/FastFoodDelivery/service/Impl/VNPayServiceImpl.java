package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.config.VNPayConfig;
import com.FastFoodDelivery.entity.Payment;
import com.FastFoodDelivery.service.VNPayService;
import com.FastFoodDelivery.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayServiceImpl implements VNPayService {
    private VNPayConfig vnPayConfig;

    private static final String SUCCESS_CODE = "00";

    /**
     * Tạo URL thanh toán VNPay
     */
    @Override
    public String createPaymentUrl(Payment payment, HttpServletRequest request) {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", VNPayConfig.vnp_Version);
        vnpParams.put("vnp_Command", VNPayConfig.vnp_Command);
        vnpParams.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount() * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", payment.getVnpTxnRef());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang #" + payment.getOrderId());
        vnpParams.put("vnp_OrderType", VNPayConfig.vnp_OrderType);
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        vnpParams.put("vnp_CreateDate", VNPayUtil.getCurrentTime());

        Calendar now = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        now.add(Calendar.MINUTE, 15);
        vnpParams.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(now.getTime()));

        // 🔍 DEBUG: In ra params trước khi tạo URL
        System.out.println("=== CREATE PAYMENT URL PARAMS ===");
        vnpParams.forEach((key, value) -> System.out.println(key + " = " + value));

        String paymentUrl = VNPayUtil.createPaymentUrl(vnpParams, VNPayConfig.vnp_PayUrl, VNPayConfig.vnp_HashSecret);

        System.out.println("=== PAYMENT URL ===");
        System.out.println(paymentUrl);

        return paymentUrl;
    }

    /**
     * Xác thực checksum từ VNPay (dùng cho return và IPN)
     */
    @Override
    public boolean validateChecksum(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        // ✅ Tạo hashData GIỐNG NHƯ LÚC TẠO URL
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (hashData.length() > 0) {
                    hashData.append('&');
                }

                // ✅ QUAN TRỌNG: Encode lại giống như lúc tạo URL
                String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8)
                        .replace("%20", "+");

                hashData.append(entry.getKey())
                        .append('=')
                        .append(encodedValue);
            }
        }

        String computedHash = VNPayUtil.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());

        return computedHash.equalsIgnoreCase(receivedHash);
    }

    @Override
    public boolean isPaymentSuccess(Map<String, String> params, Payment payment) {
        String code = params.get("vnp_ResponseCode");
        if (!SUCCESS_CODE.equals(code)) return false;

        long amount = Long.parseLong(params.get("vnp_Amount")) / 100L;
        return amount == payment.getAmount();
    }
}