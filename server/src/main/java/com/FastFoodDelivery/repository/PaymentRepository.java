package com.FastFoodDelivery.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.FastFoodDelivery.entity.Payment;

public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {
    Optional<Payment> findByVnpTxnRef(String txnRef);
    Optional<Payment> findByOrderId(ObjectId orderId);
    List<Payment> findAllByOrderId(ObjectId orderId);
    List<Payment> findAllByOrderIdAndStatus(ObjectId orderId, String status);
}
