package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Role.CreateRoleRequest;
import com.FastFoodDelivery.dto.response.Role.RoleResponse;

import java.util.List;

public interface RoleService {
    public List<RoleResponse> getAllRole();

    public RoleResponse getByRoleID(String roleID);

    public RoleResponse createRole(CreateRoleRequest request);
}
