package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Role.CreateRoleRequest;
import com.FastFoodDelivery.dto.request.Role.UpdateRoleRequest;
import com.FastFoodDelivery.dto.response.Role.RoleResponse;
import com.FastFoodDelivery.service.RoleService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
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
        ObjectId objectId = new ObjectId(roleId);
        return ResponseEntity.ok(roleService.getByRoleID(objectId));
    }

    @PostMapping()
    public ResponseEntity<RoleResponse> createRole(@RequestBody @Valid CreateRoleRequest request){
        return ResponseEntity.ok(roleService.createRole(request));
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable String roleId,
            @RequestBody @Valid UpdateRoleRequest request) {
        ObjectId objectId = new ObjectId(roleId);
        return ResponseEntity.ok(roleService.updateRole(objectId, request));
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<String> deleteRole(@PathVariable ObjectId roleId){
        roleService.deleteRole(roleId);
        return ResponseEntity.ok("Delete successfully");
    }
}
