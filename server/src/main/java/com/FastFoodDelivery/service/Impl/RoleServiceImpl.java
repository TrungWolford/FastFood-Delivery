package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Role.CreateRoleRequest;
import com.FastFoodDelivery.dto.response.Role.RoleResponse;
import com.FastFoodDelivery.entity.Role;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.RoleRepository;
import com.FastFoodDelivery.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public List<RoleResponse> getAllRole() {
        return roleRepository.findAll().stream()
                .map(RoleResponse::fromEntity)
                .toList();
    }

    @Override
    public RoleResponse getByRoleID(String roleID) {
        Role role = roleRepository.findById(roleID)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleID));
        return RoleResponse.fromEntity(role);
    }

    @Override
    public RoleResponse createRole(CreateRoleRequest request) {
        Role role = new Role();
        role.setRoleName(request.getRoleName());

        roleRepository.save(role);

        return RoleResponse.fromEntity(role);
    }
}
