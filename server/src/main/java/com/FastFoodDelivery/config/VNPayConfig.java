package com.FastFoodDelivery.config;

public class VNPayConfig {

    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:8080/api/payments/vnpay-return";
    public static final String vnp_TmnCode = "4EM6TS4E";      // Lấy từ VNPay
    public static final String vnp_BankCode = "NCB";      // Lấy từ VNPay
    public static final String vnp_HashSecret = "2KB73UFL68FNDX95OAXLL603EUHGSCS8";  // Lấy từ VNPay
    public static final String vnp_IpAddr = "127.0.0.1";
    public static final String vnp_Version = "2.1.0";
    public static final String vnp_Command = "pay";
    public static final String vnp_OrderType = "other";

}
