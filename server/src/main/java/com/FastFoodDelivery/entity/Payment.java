package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "payments")
@Data
public class Payment {
    @Id
    private ObjectId paymentId;
    private ObjectId orderId;
    private long amount;
    private String method;  // "VNPay"
    private String status;  // "PENDING", "SUCCESS", ...
    private Date createdAt;
    private Date updatedAt;

    // VNPay fields
    private String transactionNo;   // vnp_TransactionNo
    private String bankCode;        // vnp_BankCode
    private String vnpResponseCode; // vnp_ResponseCode
    private String vnpTxnRef;       // vnp_TxnRef
    private Date payDate;           // vnp_PayDate
    private String paymentUrl;      // link thanh toán
    private String secureHash;      // chữ ký bảo mật VNPay gửi lại
}
