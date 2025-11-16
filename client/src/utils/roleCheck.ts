// Role checking utility functions

export interface Role {
  roleName: string;
  roleID?: string;
}

export interface User {
  userID?: string;
  accountId?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  roles?: Role[];
}

/**
 * Check if user has Customer role
 */
export const isCustomer = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.roleName === 'CUSTOMER' || 
    role.roleName === 'Customer'
  );
};

/**
 * Check if user has Restaurant role
 */
export const isRestaurantOwner = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.roleName === 'RESTAURANT' || 
    role.roleName === 'RestaurantOwner' ||
    role.roleName === 'RESTAURANT_OWNER'
  );
};

/**
 * Check if user has Admin role
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.roleName === 'ADMIN' || 
    role.roleName === 'Admin'
  );
};

/**
 * Check if user is allowed to make purchases (only Customer role)
 */
export const canMakePurchase = (user: User | null): boolean => {
  // Guest users (not logged in) can also make purchases
  if (!user) return true;
  
  // Only Customer role can make purchases when logged in
  return isCustomer(user);
};

/**
 * Get user role display name
 */
export const getUserRoleDisplay = (user: User | null): string => {
  if (!user || !user.roles || user.roles.length === 0) {
    return 'Khách';
  }
  
  const role = user.roles[0];
  switch (role.roleName.toUpperCase()) {
    case 'ADMIN':
      return 'Quản trị viên';
    case 'CUSTOMER':
      return 'Khách hàng';
    case 'RESTAURANT':
    case 'RESTAURANTOWNER':
    case 'RESTAURANT_OWNER':
      return 'Chủ nhà hàng';
    default:
      return role.roleName;
  }
};
