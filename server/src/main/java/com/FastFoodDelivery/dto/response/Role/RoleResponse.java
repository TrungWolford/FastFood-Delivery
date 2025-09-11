package com.FastFoodDelivery.dto.response.Role;

import com.FastFoodDelivery.entity.Role;
import lombok.Data;

@Data
public class RoleResponse {
    private String roleId;
    private String roleName;

    public static RoleResponse fromEntity(Role role){
        RoleResponse response = new RoleResponse();
        response.setRoleId(role.getRoleID());
        response.setRoleName(role.getRoleName());

        return response;
    }
}
