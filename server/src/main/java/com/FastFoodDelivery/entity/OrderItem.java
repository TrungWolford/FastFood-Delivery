package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;

@Data
public class OrderItem {
    private ObjectId orderItemId;
    private ObjectId itemId;
    private Integer quantity;
    private String note;
    private long price;
    private long subTotal;
}
