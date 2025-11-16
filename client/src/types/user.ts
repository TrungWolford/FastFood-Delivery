// User types based on backend UserController, Entity, and DTOs
// Backend Entity: server/src/main/java/com/FastFoodDelivery/entity/User.java
// Backend Response: server/src/main/java/com/FastFoodDelivery/dto/response/User/UserResponse.java
// Backend Request: server/src/main/java/com/FastFoodDelivery/dto/request/User/*.java

// ===== Role Interface =====
export interface Role {
  roleId: string;      // Backend: ObjectId roleID (converted to string)
  roleName: string;    // Backend: String roleName (e.g., "CUSTOMER", "ADMIN", "RESTAURANT_OWNER", "SHIPPER")
  description?: string; // Backend: String description
}

// ===== User Response (from backend) =====
export interface User {
  userID: string;           // Backend: ObjectId userID (converted to string)
  userId?: string;          // Alias for userID (for compatibility)
  accountId?: string;       // Alias for userID (for backward compatibility with Account type)
  fullname: string;         // Backend: String fullname
  fullName?: string;        // Alias (for compatibility)
  accountName?: string;     // Alias for fullname (for backward compatibility)
  email?: string;           // Backend: String email (can be null)
  phone?: string;           // Backend: String phone (can be null)
  phoneNumber?: string;     // Alias (for compatibility)
  accountPhone?: string;    // Alias for phone (for backward compatibility)
  address?: string;         // Backend: String address
  accountAddress?: string;  // Alias for address (for backward compatibility)
  password?: string;        // Backend: String password (only in response, should not be sent to frontend normally)
  roleId: string;           // Backend: ObjectId roleId (converted to string)
  roleText: string;         // Backend: String roleText (role name)
  roles: RoleInfo[];        // Backend: List<RoleInfo> roles (for compatibility)
  restaurantId?: string;    // Backend: String restaurantId (for RESTAURANT_OWNER role)
  status: number;           // Backend: int status (0 = Khoa/Inactive, 1 = Dang hoat dong/Active)
  statusText: string;       // Backend: String statusText ("Đang hoạt động" or "Đã khóa")
  createdAt: string;        // Backend: Date createdAt (formatted as "dd/MM/yyyy")
  updatedAt?: string;       // Backend: Date updatedAt (if exists)
}

// Role info structure in UserResponse
export interface RoleInfo {
  roleId: string;
  roleName: string;
}

// ===== Create User Request =====
export interface CreateUserRequest {
  fullname?: string;        // Backend: String fullname
  accountName?: string;     // Alias for fullname (backward compatibility)
  password: string;         // Backend: String password
  email?: string;           // Backend: String email
  phone?: string;           // Backend: String phone
  accountPhone?: string;    // Alias for phone (backward compatibility)
  address?: string;         // Backend: String address
  role?: string;            // Backend: ObjectId role (send as string, backend converts)
  roleId?: string;          // Alias for role (backward compatibility)
  roleIds?: string[];       // For multiple roles (backward compatibility)
  status?: number;          // Status (0 or 1)
}

// ===== Update User Request =====
export interface UpdateUserRequest {
  fullname?: string;        // Backend: String fullname
  accountName?: string;     // Alias for fullname (backward compatibility)
  password?: string;        // Backend: String password
  email?: string;           // Backend: String email
  phone?: string;           // Backend: String phone
  accountPhone?: string;    // Alias for phone (backward compatibility)
  address?: string;         // Backend: String address
  role?: string;            // Backend: ObjectId role (send as string)
  roleId?: string;          // Alias for role (backward compatibility)
  roleIds?: string[];       // For multiple roles (backward compatibility)
  status?: number;          // Backend: int status (0 or 1)
}

// ===== Paginated Response =====
export interface PaginatedResponse<T> {
  content: T[];             // Backend: Page<T>.content
  totalElements: number;    // Backend: Page<T>.totalElements
  totalPages: number;       // Backend: Page<T>.totalPages
  size: number;             // Backend: Page<T>.size
  number: number;           // Backend: Page<T>.number (current page)
  first: boolean;           // Backend: Page<T>.first
  last: boolean;            // Backend: Page<T>.last
  empty: boolean;           // Backend: Page<T>.empty
}

// ===== User Status Enum =====
export enum UserStatus {
  INACTIVE = 0,  // Khoa (Locked)
  ACTIVE = 1     // Dang hoat dong (Active)
}

export type UserStatusType = 0 | 1;

// ===== Helper Types =====
export interface UserFilter {
  roleId?: string;
  status?: UserStatusType;
  page?: number;
  size?: number;
}

export interface UserSearchParams {
  keyword?: string;
  roleId?: string;
  status?: UserStatusType;
  page?: number;
  size?: number;
}

// ===== Service Response Wrapper =====
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===== Login/Auth Types (for reference, should be in separate auth types) =====
export interface LoginRequest {
  email?: string;           // Email or phone
  phone?: string;           // Phone number
  password: string;         // Password
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;           // JWT token (if backend implements)
}

// ===== Backend Field Mapping Reference =====
/*
Backend Entity (User.java):
- ObjectId userID       -> string userID
- String fullname       -> string fullname
- String password       -> string password (should not be exposed)
- String email          -> string email
- String phone          -> string phone
- String address        -> string address
- ObjectId roleId       -> string roleId
- Date createdAt        -> string createdAt (formatted)
- int status            -> number status (0 or 1)

Backend Response (UserResponse.java):
- String userID
- String fullname
- String password       -> SHOULD BE REMOVED in production
- String email
- String phone
- String address
- String roleId
- String roleText       -> Role name
- List<RoleInfo> roles  -> Array of roles
- String restaurantId   -> For restaurant owners
- Date createdAt        -> Formatted as "dd/MM/yyyy"
- int status
- String statusText     -> "Đang hoạt động" or "Đã khóa"

Backend Request (CreateUserRequest.java):
- String fullname
- String password
- String email
- String phone
- String address
- ObjectId role         -> Send as string ID

Backend Request (UpdateUserRequest.java):
- String fullname
- String password
- String email
- String phone
- String address
- ObjectId role         -> Send as string ID
- int status
*/
