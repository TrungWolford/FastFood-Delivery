package com.FastFoodDelivery.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "menuitems")
@Data
public class MenuItem {
    @Id
    private ObjectId itemId;
    private ObjectId restaurantId;
    private String name;
    private String description;
    private String categoryName;
    private long price;
    private String imageUrl;
    
    @Field("isAvailable")
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    private Date createdAt;
    private Date updatedAt;
}
