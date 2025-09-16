package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Role.CreateRoleRequest;
import com.FastFoodDelivery.dto.response.Role.RoleResponse;
import com.FastFoodDelivery.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRole(){
        return ResponseEntity.ok(roleService.getAllRole());
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<RoleResponse> getByRoleId(@PathVariable String roleId){
        return ResponseEntity.ok(roleService.getByRoleID(roleId));
    }

    @PostMapping()
    public ResponseEntity<RoleResponse> createRole(@RequestBody @Valid CreateRoleRequest request){
        return ResponseEntity.ok(roleService.createRole(request));
    }
}
