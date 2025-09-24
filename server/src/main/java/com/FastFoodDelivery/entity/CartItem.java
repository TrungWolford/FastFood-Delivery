package com.FastFoodDelivery.entity;

import org.bson.types.ObjectId;
import lombok.Data;

import java.util.Date;

@Data
public class CartItem {
    private ObjectId itemId;
    private Integer quantity;
    private String note;
    private Date addedAt;
}
