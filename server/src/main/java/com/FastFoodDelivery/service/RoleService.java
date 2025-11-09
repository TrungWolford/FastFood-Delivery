package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.Role.CreateRoleRequest;
import com.FastFoodDelivery.dto.request.Role.UpdateRoleRequest;
import com.FastFoodDelivery.dto.response.Role.RoleResponse;

import java.util.List;
import org.bson.types.ObjectId;

public interface RoleService {
    public List<RoleResponse> getAllRole();

    public RoleResponse getByRoleID(ObjectId roleID);

    public RoleResponse createRole(CreateRoleRequest request);

    public RoleResponse updateRole(ObjectId roleId, UpdateRoleRequest request);

    public void deleteRole(ObjectId roleId);
}
