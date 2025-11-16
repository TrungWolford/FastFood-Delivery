package com.FastFoodDelivery.entity;

import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class OrderItem {
    private ObjectId orderItemId;
    private ObjectId itemId;
    private String name;        // Tên món ăn
    private String imageUrl;    // URL hình ảnh món ăn
    private Integer quantity;
    private String note;
    private long price;
    private long subTotal;
}
