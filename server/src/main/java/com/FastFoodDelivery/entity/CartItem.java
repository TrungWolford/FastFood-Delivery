package com.FastFoodDelivery.entity;

import org.bson.types.ObjectId;
import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Data
public class CartItem {
    @Id
    private ObjectId itemId;
    private Integer quantity;
    private String note;
    private Date addedAt;
}
