package com.FastFoodDelivery.dto.callback.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Data
public class VNPayReturn {
    private String vnp_Amount;
    private String vnp_BankCode;
    private String vnp_BankTranNo;
    private String vnp_CardType;
    private String vnp_OrderInfo;
    private String vnp_PayDate;
    private String vnp_ResponseCode;
    private String vnp_TmnCode;
    private String vnp_TransactionNo;
    private String vnp_TransactionStatus;
    private String vnp_TxnRef;
    private String vnp_SecureHash;

    // ✅ Convert từ request sang object
    public static VNPayReturn fromRequest(HttpServletRequest request) {
        VNPayReturn dto = new VNPayReturn();
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String value = request.getParameter(paramName);
            switch (paramName) {
                case "vnp_Amount": dto.setVnp_Amount(value); break;
                case "vnp_BankCode": dto.setVnp_BankCode(value); break;
                case "vnp_BankTranNo": dto.setVnp_BankTranNo(value); break;
                case "vnp_CardType": dto.setVnp_CardType(value); break;
                case "vnp_OrderInfo": dto.setVnp_OrderInfo(value); break;
                case "vnp_PayDate": dto.setVnp_PayDate(value); break;
                case "vnp_ResponseCode": dto.setVnp_ResponseCode(value); break;
                case "vnp_TmnCode": dto.setVnp_TmnCode(value); break;
                case "vnp_TransactionNo": dto.setVnp_TransactionNo(value); break;
                case "vnp_TransactionStatus": dto.setVnp_TransactionStatus(value); break;
                case "vnp_TxnRef": dto.setVnp_TxnRef(value); break;
                case "vnp_SecureHash": dto.setVnp_SecureHash(value); break;
            }
        }
        return dto;
    }

    // ✅ Lấy dữ liệu dạng map (bỏ SecureHash để tạo lại khi verify)
    public Map<String, String> toMapWithoutSecureHash() {
        Map<String, String> map = new HashMap<>();
        map.put("vnp_Amount", vnp_Amount);
        map.put("vnp_BankCode", vnp_BankCode);
        map.put("vnp_BankTranNo", vnp_BankTranNo);
        map.put("vnp_CardType", vnp_CardType);
        map.put("vnp_OrderInfo", vnp_OrderInfo);
        map.put("vnp_PayDate", vnp_PayDate);
        map.put("vnp_ResponseCode", vnp_ResponseCode);
        map.put("vnp_TmnCode", vnp_TmnCode);
        map.put("vnp_TransactionNo", vnp_TransactionNo);
        map.put("vnp_TransactionStatus", vnp_TransactionStatus);
        map.put("vnp_TxnRef", vnp_TxnRef);

        // Xoá các key null để tránh lỗi khi join
        map.entrySet().removeIf(entry -> entry.getValue() == null);
        return map;
    }

    // ✅ Convert chuỗi thời gian của VNPay thành Date (nếu có)
    public Date getPayDate() {
        if (vnp_PayDate == null) return null;
        try {
            return new SimpleDateFormat("yyyyMMddHHmmss").parse(vnp_PayDate);
        } catch (ParseException e) {
            return null;
        }
    }
}
