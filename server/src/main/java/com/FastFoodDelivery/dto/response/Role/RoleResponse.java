package com.FastFoodDelivery.dto.response.Role;

import com.FastFoodDelivery.entity.Role;
import lombok.Data;
import org.bson.types.ObjectId;

@Data
public class RoleResponse {
    private ObjectId roleId;
    private String roleName;

    public static RoleResponse fromEntity(Role role){
        RoleResponse response = new RoleResponse();
        response.setRoleId(role.getRoleID().toString());
        response.setRoleName(role.getRoleName());

        return response;
    }
}
