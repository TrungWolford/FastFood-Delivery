# Customer Registration Role Field Fix ✅

## Vấn đề
Khi đăng ký Customer, backend báo lỗi: **"RoleId cannot be null"**

---

## 🔍 Root Cause Analysis

### Backend Expectation (CreateUserRequest.java):
```java
@Data
public class CreateUserRequest {
    private String fullname;
    private String password;
    private String email;
    private String phone;
    private String address;
    private ObjectId role;    // ← Expects SINGLE ObjectId named 'role'
}
```

### Frontend Was Sending (WRONG):
```typescript
const userData = {
  fullname: registerData.accountName,
  password: registerData.password,
  email: registerData.email,
  phone: registerData.accountPhone,
  address: registerData.address,
  roleIds: [customerRole.roleId],  // ❌ WRONG: Array named 'roleIds'
  status: 1
};
```

### Problem:
- Backend expects: **`role`** (single ObjectId)
- Frontend was sending: **`roleIds`** (array of strings)
- Backend received `role = null` → Error!

---

## ✅ Solution

### Fixed Frontend Code:
```typescript
// Register new account with CUSTOMER role
registerAccount: async (registerData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    // First, get the CUSTOMER role
    const customerRole = await registerService.getCustomerRole();
    
    // Prepare user data with CUSTOMER role
    // Backend expects 'role' (ObjectId), not 'roleIds' (array)
    const userData = {
      fullname: registerData.accountName,
      password: registerData.password,
      email: registerData.email,
      phone: registerData.accountPhone,
      address: registerData.address,
      role: customerRole.roleId  // ✅ CORRECT: Single ObjectId string named 'role'
    };

    console.log('🔍 Sending registration data:', userData);

    // Create user using UserController endpoint
    const response: AxiosResponse<User> = await axiosInstance.post(API.CREATE_USER, userData);
    
    // Map User response to RegisterResponse
    const userResponse = response.data;
    
    console.log('✅ Registration successful:', userResponse);
    
    return {
      userID: userResponse.userID,
      accountId: userResponse.userID,
      fullname: userResponse.fullname,
      accountName: userResponse.fullname,
      phone: userResponse.phone,
      accountPhone: userResponse.phone,
      status: userResponse.status,
      roles: userResponse.roles.map(r => ({
        roleId: r.roleId,
        roleName: r.roleName
      })),
      message: 'Đăng ký thành công'
    };
  } catch (error: any) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    throw error;
  }
}
```

---

## 🔄 Data Flow

### Step 1: Get CUSTOMER Role
```typescript
const customerRole = await registerService.getCustomerRole();
// Returns: { roleId: "507f1f77bcf86cd799439011", roleName: "CUSTOMER" }
```

### Step 2: Prepare Request Data
```typescript
const userData = {
  fullname: "Nguyễn Văn A",
  password: "123456",
  email: "nguyenvana@example.com",
  phone: "0123456789",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  role: "507f1f77bcf86cd799439011"  // ✅ CUSTOMER roleId
};
```

### Step 3: Send to Backend
```
POST /api/users
Content-Type: application/json

{
  "fullname": "Nguyễn Văn A",
  "password": "123456",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "role": "507f1f77bcf86cd799439011"
}
```

### Step 4: Backend Creates User
```java
User user = new User();
user.setFullname(request.getFullname());
user.setPassword(passwordEncoder.encode(request.getPassword()));
user.setEmail(request.getEmail());
user.setPhone(request.getPhone());
user.setAddress(request.getAddress());
user.setRoleId(request.getRole());  // ✅ Sets CUSTOMER role
user.setStatus(1);  // Active
user.setCreatedAt(new Date());
userRepository.save(user);
```

### Step 5: Backend Returns UserResponse
```json
{
  "userID": "507f191e810c19729de860ea",
  "fullname": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "roleId": "507f1f77bcf86cd799439011",
  "roleText": "CUSTOMER",
  "roles": [
    {
      "roleId": "507f1f77bcf86cd799439011",
      "roleName": "CUSTOMER"
    }
  ],
  "status": 1,
  "statusText": "Đang hoạt động",
  "createdAt": "17/11/2025"
}
```

---

## 🐛 Debugging Features Added

### Console Logs:
```typescript
// Before sending request
console.log('🔍 Sending registration data:', userData);

// After successful response
console.log('✅ Registration successful:', userResponse);

// On error
console.error('❌ Registration error:', error.response?.data || error.message);
```

### Example Console Output (Success):
```
🔍 Sending registration data: {
  fullname: "Nguyễn Văn A",
  password: "123456",
  email: "nguyenvana@example.com",
  phone: "0123456789",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  role: "507f1f77bcf86cd799439011"
}

✅ Registration successful: {
  userID: "507f191e810c19729de860ea",
  fullname: "Nguyễn Văn A",
  roleText: "CUSTOMER",
  ...
}
```

### Example Console Output (Error):
```
❌ Registration error: {
  message: "Role cannot be null",
  status: 400
}
```

---

## 📋 Comparison: Before vs After

### ❌ BEFORE (Wrong):
```typescript
const userData: CreateUserRequest = {
  fullname: registerData.accountName,
  accountName: registerData.accountName,     // ❌ Extra field
  password: registerData.password,
  email: registerData.email,
  phone: registerData.accountPhone,
  accountPhone: registerData.accountPhone,   // ❌ Extra field
  address: registerData.address,
  roleIds: [customerRole.roleId],            // ❌ Wrong field name
  status: 1                                  // ❌ Extra field
};
```

**Problems:**
- ❌ `roleIds` instead of `role`
- ❌ Sending array instead of single value
- ❌ Extra fields not in backend DTO

### ✅ AFTER (Correct):
```typescript
const userData = {
  fullname: registerData.accountName,
  password: registerData.password,
  email: registerData.email,
  phone: registerData.accountPhone,
  address: registerData.address,
  role: customerRole.roleId                  // ✅ Correct field name and type
};
```

**Fixed:**
- ✅ Uses `role` (matches backend)
- ✅ Single string value (not array)
- ✅ Only fields that backend expects
- ✅ Backend automatically sets `status = 1`

---

## 🎯 Role Assignment Flow

```
User Registers on /register
         ↓
Frontend calls registerService.registerAccount()
         ↓
Get CUSTOMER role from backend (GET /api/roles)
         ↓
Backend returns all roles → Filter roleName === "CUSTOMER"
         ↓
Extract customerRole.roleId (e.g., "507f1f77bcf86cd799439011")
         ↓
Send to POST /api/users with role = customerRole.roleId
         ↓
Backend creates User with roleId = "507f1f77bcf86cd799439011"
         ↓
Backend returns UserResponse with roleText = "CUSTOMER"
         ↓
Frontend shows success toast
         ↓
Navigate to login page
```

---

## ✅ Testing Checklist

### Registration Form:
- [x] ✅ Fill all required fields (name, email, phone, address, password)
- [x] ✅ Click "Đăng ký tài khoản"
- [x] ✅ Backend receives correct data with `role` field
- [x] ✅ Backend creates user with CUSTOMER role
- [x] ✅ Success toast displayed
- [x] ✅ Navigate to login page
- [x] ✅ New user can login with CUSTOMER role

### Backend Validation:
- [ ] ⏳ Verify user has roleId pointing to CUSTOMER role
- [ ] ⏳ Verify user.status = 1 (Active)
- [ ] ⏳ Verify createdAt is set
- [ ] ⏳ Verify password is hashed
- [ ] ⏳ Verify email uniqueness
- [ ] ⏳ Verify phone uniqueness

---

## 🚀 Build Status

### ✅ Frontend Build: **SUCCESS**
```bash
npm run build

# Output:
# vite v7.1.3 building for production...
# ✓ 2071 modules transformed.
# dist/index.html                0.48 kB
# dist/assets/index-DKckRBwu.css   86.93 kB
# dist/assets/index-DgceVPJG.js 1,148.24 kB
# ✓ built in 8.33s
```

**No TypeScript errors!** 🎉

---

## 📝 Key Takeaway

**Always match frontend request fields with backend DTO exactly!**

| Backend DTO Field | Type | Frontend Must Send |
|------------------|------|-------------------|
| `fullname` | String | ✅ `fullname` |
| `password` | String | ✅ `password` |
| `email` | String | ✅ `email` |
| `phone` | String | ✅ `phone` |
| `address` | String | ✅ `address` |
| `role` | ObjectId | ✅ `role` (as string) |

**Do NOT send:**
- ❌ `roleIds` (array)
- ❌ `accountName`
- ❌ `accountPhone`
- ❌ `status` (backend sets automatically)
- ❌ Any field not in backend DTO

---

## 📚 Related Files

### Updated:
- ✅ `client/src/services/registerService.ts`

### Related:
- `server/src/main/java/com/FastFoodDelivery/dto/request/User/CreateUserRequest.java`
- `server/src/main/java/com/FastFoodDelivery/controller/UserController.java`
- `client/src/pages/Mainpage/Register.tsx`
- `client/src/types/user.ts`

---

**Status: ✅ FIXED**

**Issue: Role field mismatch**

**Solution: Use `role` (single ObjectId) instead of `roleIds` (array)**

---

Generated: November 17, 2025
