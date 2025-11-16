package com.FastFoodDelivery.dto.response.User;

import com.FastFoodDelivery.entity.Role;
import com.FastFoodDelivery.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class UserResponse {
    private String userID;
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private String roleId;
    private String roleText;
    private List<RoleInfo> roles; // Added for frontend compatibility
    private String restaurantId; // Added to include restaurant ID for restaurant owners

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date createdAt;
    private int status;
    private String statusText;

    @Data
    public static class RoleInfo {
        private String roleId;
        private String roleName;

        public RoleInfo(String roleId, String roleName) {
            this.roleId = roleId;
            this.roleName = roleName;
        }
    }

    public static UserResponse fromEntity(User user, Role role, String restaurantId){
        UserResponse response = new UserResponse();
        response.setUserID(user.getUserID().toString());
        response.setFullname(user.getFullname());
        response.setPassword(user.getPassword());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRoleId(user.getRoleId().toString());
        response.setRoleText(role.getRoleName());
        response.setCreatedAt(user.getCreatedAt());
        response.setStatus(user.getStatus());
        response.setStatusText(user.getStatus() == 1 ? "Đang hoạt động" : "Đã khóa");
        response.setRestaurantId(restaurantId); // Set restaurant ID if available
        
        // Add roles array for frontend compatibility
        List<RoleInfo> roles = new ArrayList<>();
        roles.add(new RoleInfo(role.getRoleID().toString(), role.getRoleName()));
        response.setRoles(roles);

        return response;
    }
}
