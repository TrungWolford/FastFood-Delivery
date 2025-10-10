package com.FastFoodDelivery.repository;

import com.FastFoodDelivery.entity.Payment;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {
    Optional<Payment> findByVnpTxnRef(String txnRef);
    Optional<Payment> findByOrderId(ObjectId orderId);
}
