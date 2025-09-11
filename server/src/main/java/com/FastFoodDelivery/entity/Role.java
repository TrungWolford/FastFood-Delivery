package com.FastFoodDelivery.entity;

import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles")
@Data
public class Role {
    @Id
    private String roleID;

    private String roleName;
}
