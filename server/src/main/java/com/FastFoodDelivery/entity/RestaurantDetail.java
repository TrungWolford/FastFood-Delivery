package com.FastFoodDelivery.entity;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "restaurantDetails")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDetail {
    @Id
    private ObjectId restaurantDetailId;  // Primary Key - Restaurant detail ID
    @Indexed(unique = true)
    private ObjectId restaurantId;  // Foreign Key - One-to-one relationship with Restaurant
    
    // Operating Info
    private String openingHours;    // Format: "06:00-23:00"
    private List<String> restaurantTypes;      // Max 2 (e.g., ["Phở", "Cơm Tấm"])
    private List<String> cuisines;             // (e.g., ["Châu Á", "Việt Nam"])
    private List<String> specialties;          // Max 3 (e.g., ["Phở Bò", "Cơm Tấm Sườn"])
    
    // Content
    private String description;     // Long text description
    private String coverImage;      // Banner image
    private List<String> menuImages;// Menu photos
    
    private Date createdAt;
    private Date updatedAt;
}
