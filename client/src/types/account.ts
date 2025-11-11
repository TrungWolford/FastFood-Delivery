// Account interfaces theo backend AccountController
export interface Account {
  userID?: string; // Backend trả về userID
  accountId?: string; // Alias cho userID để tương thích
  accountName?: string; // Frontend naming
  fullname?: string; // Backend naming
  accountPhone?: string; // Frontend naming
  phone?: string; // Backend naming
  email?: string;
  address?: string;
  password?: string;
  roleId?: string; // Backend trả về roleId
  roleText?: string; // Backend trả về roleText
  status: number; // 0 = INACTIVE, 1 = ACTIVE
  statusText?: string; // Backend trả về statusText
  roles: Role[]; // Backend trả về roles array
  createdAt?: string;
}

export interface CreateAccountRequest {
  accountName: string;
  accountPhone: string;
  password: string;
  status: number;
  roleIds: string[]; // Backend nhận Set<String> roleIds
}

export interface UpdateAccountRequest {
  accountName?: string;
  accountPhone?: string;
  password?: string;
  status?: number;
  roleIds?: string[];
}

export interface LoginRequest {
  accountPhone: string;
  password: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Role interface
export interface Role {
  roleId: string;
  roleName: string;
}

export type AccountStatus = 0 | 1; // 0 = INACTIVE, 1 = ACTIVE
